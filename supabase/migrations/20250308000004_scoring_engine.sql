-- Add unique constraint to allow safe upserts when recalculating scores
ALTER TABLE opportunities ADD CONSTRAINT unique_problem_per_workspace UNIQUE (workspace_id, problem_id);

-- 1. Mock AI Clustering (Simulates LLM grouping signals into problems)
CREATE OR REPLACE FUNCTION mock_ai_clustering(p_workspace_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    area_record RECORD;
    new_problem_id uuid;
BEGIN
    -- Ensure user has access
    IF NOT is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Group unassigned signals by product_area (or 'General' if null)
    FOR area_record IN 
        SELECT COALESCE(product_area, 'General') as area, count(*) as sig_count
        FROM signals
        WHERE workspace_id = p_workspace_id AND problem_id IS NULL
        GROUP BY COALESCE(product_area, 'General')
    LOOP
        -- Create a canonical problem for this cluster
        INSERT INTO problems (workspace_id, title, description, product_area, status, severity)
        VALUES (
            p_workspace_id, 
            'Friction in ' || area_record.area, 
            'Multiple signals indicate users are experiencing issues or requesting features in the ' || area_record.area || ' area.',
            area_record.area,
            'Active',
            'Medium'
        ) RETURNING id INTO new_problem_id;

        -- Assign the raw signals to this new problem
        UPDATE signals
        SET problem_id = new_problem_id
        WHERE workspace_id = p_workspace_id 
          AND problem_id IS NULL 
          AND COALESCE(product_area, 'General') = area_record.area;
    END LOOP;
END;
$$;

-- 2. Compute Opportunity Scores (The Core Math Engine)
CREATE OR REPLACE FUNCTION compute_opportunity_scores(p_workspace_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    prob RECORD;
    calc_evidence_count int;
    calc_affected_arr numeric;
    calc_demand_score int;
    calc_pain_score int;
    calc_arr_score int;
    calc_trend_score int;
    calc_total_score int;
    rec_action text;
BEGIN
    -- Ensure user has access
    IF NOT is_workspace_member(p_workspace_id) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Iterate over all active problems in the workspace
    FOR prob IN SELECT id, severity FROM problems WHERE workspace_id = p_workspace_id LOOP
        
        -- Calculate evidence count (Demand)
        SELECT count(*) INTO calc_evidence_count
        FROM signals
        WHERE problem_id = prob.id;

        -- Calculate affected ARR (Sum of unique accounts linked to these signals)
        SELECT COALESCE(sum(arr), 0) INTO calc_affected_arr
        FROM accounts
        WHERE id IN (
            SELECT DISTINCT account_id 
            FROM signals 
            WHERE problem_id = prob.id AND account_id IS NOT NULL
        );

        -- Update the problem record with aggregated stats
        UPDATE problems 
        SET evidence_count = calc_evidence_count,
            affected_arr = calc_affected_arr,
            updated_at = now()
        WHERE id = prob.id;

        -- Calculate Component Scores (0-100 scale)
        calc_demand_score := LEAST(100, calc_evidence_count * 10);
        calc_arr_score := LEAST(100, (calc_affected_arr / 5000)::int);
        
        calc_pain_score := CASE prob.severity
            WHEN 'Critical' THEN 95
            WHEN 'High' THEN 75
            WHEN 'Medium' THEN 50
            WHEN 'Low' THEN 25
            ELSE 50
        END;

        calc_trend_score := 50; -- Default baseline for MVP

        -- Weighted Total Score Formula
        calc_total_score := (calc_demand_score * 0.30) + (calc_pain_score * 0.25) + (calc_arr_score * 0.30) + (calc_trend_score * 0.15);

        -- Determine Recommended Action
        IF calc_total_score >= 80 THEN
            rec_action := 'Build';
        ELSIF calc_total_score >= 60 THEN
            rec_action := 'Fix';
        ELSE
            rec_action := 'Review';
        END IF;

        -- Upsert Opportunity
        INSERT INTO opportunities (
            workspace_id, problem_id, opportunity_score, demand_score, 
            pain_score, arr_score, trend_score, recommended_action
        ) VALUES (
            p_workspace_id, prob.id, calc_total_score, calc_demand_score,
            calc_pain_score, calc_arr_score, calc_trend_score, rec_action
        )
        ON CONFLICT (workspace_id, problem_id) DO UPDATE 
        SET opportunity_score = EXCLUDED.opportunity_score,
            demand_score = EXCLUDED.demand_score,
            pain_score = EXCLUDED.pain_score,
            arr_score = EXCLUDED.arr_score,
            trend_score = EXCLUDED.trend_score,
            recommended_action = EXCLUDED.recommended_action,
            updated_at = now();
            
    END LOOP;
END;
$$;
