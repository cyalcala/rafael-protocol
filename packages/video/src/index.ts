/**
 * Rafael Video Module
 * Video Ingestion and Human in the Loop Integration
 */

import type { 
  VideoJob, 
  VideoFrame, 
  VideoAnalysis,
  HumanInTheLoopSession,
  HumanIntervention,
  HoLMode 
} from '@rafael/types';

/**
 * Video Ingestion Service
 * Handles video streams from screen capture, webcam, or file uploads
 */
export class VideoIngestionService {
  private frames: Map<string, VideoFrame[]> = new Map();
  private maxFramesPerJob = 1000;
  
  /**
   * Start a new video ingestion job
   */
  async startJob(params: {
    source: 'screen' | 'webcam' | 'file';
    sessionId: string;
    fps?: number;
  }): Promise<VideoJob> {
    const job: VideoJob = {
      id: `video_${Date.now()}`,
      sessionId: params.sessionId,
      source: params.source,
      fps: params.fps || 1,
      status: 'processing',
      startedAt: Date.now(),
      frames: []
    };
    
    this.frames.set(job.id, []);
    
    console.log(`[VideoIngestion] Started job ${job.id} from ${params.source}`);
    
    return job;
  }

  /**
   * Process a video frame
   */
  async processFrame(jobId: string, frame: VideoFrame): Promise<void> {
    const frames = this.frames.get(jobId);
    if (!frames) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    if (frames.length >= this.maxFramesPerJob) {
      frames.shift();
    }
    
    frames.push({
      ...frame,
      timestamp: Date.now()
    });
  }

  /**
   * Analyze video frames for user behavior
   */
  async analyzeJob(jobId: string): Promise<VideoAnalysis> {
    const frames = this.frames.get(jobId);
    if (!frames) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    const totalFrames = frames.length;
    const duration = frames.length > 1 
      ? frames[frames.length - 1].timestamp - frames[0].timestamp 
      : 0;
    
    const behavior = this.analyzeUserBehavior(frames);
    const confusionSignals = this.detectConfusion(frames);
    const insights = this.generateInsights(behavior, confusionSignals);
    
    return {
      jobId,
      totalFrames,
      duration,
      behavior,
      confusionSignals,
      insights,
      completedAt: Date.now()
    };
  }

  private analyzeUserBehavior(frames: VideoFrame[]) {
    return {
      mouseMovements: frames.length,
      keyboardActivity: Math.floor(frames.length * 0.3),
      idleTime: 0,
      engagementScore: 0.75
    };
  }

  private detectConfusion(frames: VideoFrame[]) {
    return {
      repeatedActions: 0,
      longPauses: 0,
      returningToPrevious: false,
      confusionScore: 0.1
    };
  }

  private generateInsights(behavior: any, confusion: any): string[] {
    const insights: string[] = [];
    if (confusion.confusionScore > 0.5) {
      insights.push('User appears confused - consider intervention');
    }
    if (behavior.idleTime > 30000) {
      insights.push('User has been idle for 30+ seconds');
    }
    return insights;
  }

  async completeJob(jobId: string): Promise<VideoJob> {
    const frames = this.frames.get(jobId);
    if (!frames) {
      throw new Error(`Job ${jobId} not found`);
    }
    
    return {
      id: jobId,
      sessionId: '',
      source: 'screen',
      fps: 1,
      status: 'completed',
      startedAt: 0,
      completedAt: Date.now(),
      frames: frames.map(f => f.timestamp)
    };
  }
}

/**
 * Human in the Loop (HoL) Service
 */
export class HumanInTheLoopService {
  private activeSessions: Map<string, HumanInTheLoopSession> = new Map();
  private pendingInterventions: Map<string, HumanIntervention> = new Map();
  
  async createSession(params: {
    sessionId: string;
    mode: HoLMode;
    triggerCondition: string;
  }): Promise<HumanInTheLoopSession> {
    const session: HumanInTheLoopSession = {
      id: `hol_${Date.now()}`,
      sessionId: params.sessionId,
      mode: params.mode,
      triggerCondition: params.triggerCondition,
      status: 'active',
      createdAt: Date.now(),
      interventions: [],
      autoApprove: params.mode === 'auto'
    };
    
    this.activeSessions.set(session.id, session);
    console.log(`[HoL] Created session ${session.id} in ${params.mode} mode`);
    
    return session;
  }

  async requestIntervention(params: {
    sessionId: string;
    reason: string;
    context: Record<string, unknown>;
    options?: string[];
    timeout?: number;
  }): Promise<HumanIntervention> {
    const session = Array.from(this.activeSessions.values())
      .find(s => s.sessionId === params.sessionId);
    
    if (!session) {
      throw new Error(`HoL session for ${params.sessionId} not found`);
    }
    
    if (session.autoApprove) {
      return {
        id: `intervention_${Date.now()}`,
        sessionId: params.sessionId,
        type: 'auto_approved',
        reason: params.reason,
        context: params.context,
        status: 'approved',
        createdAt: Date.now(),
        resolvedAt: Date.now(),
        response: 'auto-approved'
      };
    }
    
    const intervention: HumanIntervention = {
      id: `intervention_${Date.now()}`,
      sessionId: params.sessionId,
      type: this.determineInterventionType(params.reason),
      reason: params.reason,
      context: params.context,
      options: params.options,
      status: 'pending',
      createdAt: Date.now(),
      timeout: params.timeout || 30000
    };
    
    this.pendingInterventions.set(intervention.id, intervention);
    session.interventions.push(intervention);
    
    console.log(`[HoL] Intervention requested: ${params.reason}`);
    
    if (params.timeout) {
      setTimeout(() => {
        this.handleTimeout(intervention.id);
      }, params.timeout);
    }
    
    return intervention;
  }

  private determineInterventionType(reason: string): HumanIntervention['type'] {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('confidence')) return 'confirmation';
    if (lowerReason.includes('error')) return 'error_recovery';
    if (lowerReason.includes('permission')) return 'permission';
    if (lowerReason.includes('clarification')) return 'clarification';
    return 'general';
  }

  private async handleTimeout(interventionId: string): Promise<void> {
    const intervention = this.pendingInterventions.get(interventionId);
    if (!intervention || intervention.status !== 'pending') return;
    
    intervention.status = 'timeout';
    intervention.response = 'No response - proceeding with default action';
  }

  async resolveIntervention(params: {
    interventionId: string;
    response: string;
    approved: boolean;
  }): Promise<HumanIntervention> {
    const intervention = this.pendingInterventions.get(params.interventionId);
    if (!intervention) {
      throw new Error(`Intervention ${params.interventionId} not found`);
    }
    
    intervention.status = params.approved ? 'approved' : 'rejected';
    intervention.response = params.response;
    intervention.resolvedAt = Date.now();
    
    return intervention;
  }

  getPendingInterventions(sessionId: string): HumanIntervention[] {
    return Array.from(this.pendingInterventions.values())
      .filter(i => i.sessionId === sessionId && i.status === 'pending');
  }

  async endSession(sessionId: string): Promise<void> {
    const session = Array.from(this.activeSessions.values())
      .find(s => s.sessionId === sessionId);
    
    if (session) {
      session.status = 'completed';
      session.endedAt = Date.now();
      this.activeSessions.delete(session.id);
    }
  }
}

/**
 * Combined Video + HoL Manager
 */
export class VideoHoLManager {
  private videoService: VideoIngestionService;
  private holService: HumanInTheLoopService;
  
  constructor() {
    this.videoService = new VideoIngestionService();
    this.holService = new HumanInTheLoopService();
  }
  
  async startSession(params: {
    sessionId: string;
    videoSource: 'screen' | 'webcam' | 'file';
    holMode: HoLMode;
    autoInterventionConditions: string[];
  }): Promise<{ videoJob: VideoJob; holSession: HumanInTheLoopSession }> {
    const videoJob = await this.videoService.startJob({
      source: params.videoSource,
      sessionId: params.sessionId
    });
    
    const holSession = await this.holService.createSession({
      sessionId: params.sessionId,
      mode: params.holMode,
      triggerCondition: params.autoInterventionConditions.join(' OR ')
    });
    
    return { videoJob, holSession };
  }

  async processFrameWithInterventionCheck(
    jobId: string,
    frame: VideoFrame,
    currentConfidence: number
  ): Promise<{ processed: boolean; intervention?: HumanIntervention }> {
    await this.videoService.processFrame(jobId, frame);
    
    if (currentConfidence < 0.7) {
      const intervention = await this.holService.requestIntervention({
        sessionId: frame.sessionId,
        reason: `Low confidence: ${currentConfidence}`,
        context: { frameTimestamp: frame.timestamp, confidence: currentConfidence },
        options: ['Approve suggested action', 'Provide clarification', 'Cancel']
      });
      
      return { processed: true, intervention };
    }
    
    return { processed: true };
  }

  async getSessionAnalysis(jobId: string): Promise<{
    video: VideoAnalysis;
    interventions: HumanIntervention[];
    recommendations: string[];
  }> {
    const video = await this.videoService.analyzeJob(jobId);
    
    const recommendations: string[] = [];
    
    if (video.confusionSignals.confusionScore > 0.5) {
      recommendations.push('Trigger proactive HoL intervention');
    }
    
    if (video.behavior.idleTime > 60000) {
      recommendations.push('Send re-engagement prompt');
    }
    
    if (video.behavior.engagementScore < 0.3) {
      recommendations.push('Offer tutorial or help');
    }
    
    return {
      video,
      interventions: [],
      recommendations
    };
  }
}
