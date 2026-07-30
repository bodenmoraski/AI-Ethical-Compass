import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  authErrorStatus,
  getServiceClient,
  requireAppUser,
  setCors,
} from '../lib/api-auth.js';

const supabase = getServiceClient();

/**
 * Scenario completion progress for the signed-in user.
 *
 * The user id is taken from the bearer token, never from the body — otherwise any
 * caller could mark scenarios complete on someone else's behalf.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await requireAppUser(req, supabase);
    const { scenarioId, completed } = req.body || {};

    if (!scenarioId) {
      return res.status(400).json({ message: 'scenarioId is required' });
    }

    const { data: scenarioCheck, error: scenarioError } = await supabase
      .from('scenarios')
      .select('id')
      .eq('id', scenarioId)
      .eq('is_active', true)
      .single();

    if (scenarioError || !scenarioCheck) {
      return res.status(400).json({
        message: `Scenario with ID ${scenarioId} does not exist or is not active`
      });
    }

    const { data: existingProgress, error: checkError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('scenario_id', scenarioId)
      .maybeSingle();

    if (checkError) {
      console.error('Progress check error:', checkError);
      return res.status(500).json({
        message: 'Failed to check existing progress',
        error: checkError.message
      });
    }

    let progressRecord;

    if (existingProgress) {
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_progress')
        .update({
          completed: completed ?? existingProgress.completed,
          completed_at: completed ? new Date().toISOString() : existingProgress.completed_at,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('scenario_id', scenarioId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({
          message: 'Failed to update progress',
          error: updateError.message
        });
      }

      progressRecord = updatedProgress;
    } else {
      const { data: newProgress, error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          scenario_id: scenarioId,
          completed: completed ?? false,
          completed_at: completed ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({
          message: 'Failed to create progress',
          error: insertError.message
        });
      }

      progressRecord = newProgress;
    }

    return res.status(200).json({
      id: progressRecord.id,
      userId: progressRecord.user_id,
      scenarioId: progressRecord.scenario_id,
      completed: progressRecord.completed,
      completedAt: progressRecord.completed_at,
      createdAt: progressRecord.created_at,
      updatedAt: progressRecord.updated_at
    });
  } catch (error) {
    const status = authErrorStatus(error);
    if (status === 500) console.error('Progress API error:', error);
    return res.status(status).json({
      message: error instanceof Error ? error.message : 'Failed to update progress',
    });
  }
}
