/**
 * ============================================
 * AGENT X → AGENT Y HANDOVER SYSTEM
 * Complete Production-Ready Implementation
 * ============================================
 * 
 * Privacy-First SaaS Project Assignment & Collaboration Platform
 * 
 * Key Features:
 * - Complete data sanitization (no personal info shared)
 * - Internal agent-to-agent chat
 * - Document management with versioning
 * - Full audit trail
 * - Status workflow management
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  FileText, 
  Clock, 
  Send, 
  Paperclip, 
  Download, 
  Upload, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Calendar,
  MapPin,
  Ruler,
  Shield,
  Activity,
  Eye,
  FileCheck,
  MessageCircle,
  ArrowRight,
  Info
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

type ProjectStatus = 
  | 'draft'
  | 'assigned'
  | 'under_review'
  | 'clarification_requested'
  | 'awaiting_documents'
  | 'completed'
  | 'archived';

type MessageType = 
  | 'text'
  | 'document_request'
  | 'document_upload'
  | 'status_update'
  | 'system';

type DocumentCategory = 
  | 'drawings'
  | 'site_plans'
  | 'reports'
  | 'clarifications'
  | 'supporting_docs';

type ActivityType =
  | 'project_created'
  | 'assigned_to_agent'
  | 'status_changed'
  | 'message_sent'
  | 'document_uploaded'
  | 'document_approved'
  | 'document_requested'
  | 'project_locked';

interface Agent {
  id: string;
  name: string;
  role: 'agent_x' | 'agent_y';
  avatar?: string;
  specialization?: string[];
  activeProjects: number;
}

interface SanitizedProjectData {
  projectId: string;
  propertyType: string;
  siteAddress: string;
  postcode: string;
  developmentPurpose: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    units: 'meters' | 'feet';
  };
  constraints: string[];
  requireddocs:string[];
  materials: string[];
  planningNotes: string;
}

interface Project {
  id: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedToAgentY: string | null;
  assignedAt: Date | null;
  assignedBy: string;
  sanitizedData: SanitizedProjectData;
  locked: boolean;
}

interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderRole: 'agent_x' | 'agent_y';
  senderName: string;
  messageType: MessageType;
  content: string;
  timestamp: Date;
  readBy: string[];
  metadata?: {
    requestedDocumentType?: string;
    statusChange?: { from: ProjectStatus; to: ProjectStatus };
  };
}

interface Document {
  id: string;
  projectId: string;
  filename: string;
  category: DocumentCategory;
  version: number;
  uploadedBy: string;
  uploadedByRole: 'agent_x' | 'agent_y';
  uploadedAt: Date;
  fileSize: number;
  status: 'pending_review' | 'approved' | 'rejected';
}

interface ActivityLogEntry {
  id: string;
  projectId: string;
  timestamp: Date;
  activityType: ActivityType;
  performedBy: string;
  performedByRole: 'agent_x' | 'agent_y' | 'system';
  description: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockAgentsY: Agent[] = [
  { 
    id: 'ay-001', 
    name: 'Sarah Mitchell', 
    role: 'agent_y',
    specialization: ['Residential', 'Extensions'],
    activeProjects: 3 
  },
  { 
    id: 'ay-002', 
    name: 'James Chen', 
    role: 'agent_y',
    specialization: ['Commercial', 'New Builds'],
    activeProjects: 5 
  },
  { 
    id: 'ay-003', 
    name: 'Emily Rodriguez', 
    role: 'agent_y',
    specialization: ['Conservation', 'Listed Buildings'],
    activeProjects: 2 
  }
];

const mockProject: Project = {
  id: 'Z7@qL2',
  status: 'draft',
  createdAt: new Date('2024-02-13T09:30:00'),
  updatedAt: new Date('2024-02-13T09:30:00'),
  assignedToAgentY: null,
  assignedAt: null,
  assignedBy: 'ax-001',
  locked: false,
  sanitizedData: {
    projectId: 'Z7@qL2',
    propertyType: 'Terraced house',
    siteAddress: '45 Oakwood Avenue, London',
    postcode: 'E1 6RF',
    developmentPurpose: 'Single-storey rear extension with open-plan kitchen-dining and rear glazing.',
    dimensions: {
      length: 4.5,
      width: 3.2,
      height: 2.8,
      units: 'meters'
    },
    
    constraints: [
      'Conservation area boundary 50m north',
      'Neighbor wall shared on east side',
      'Existing drainage runs along rear boundary'
      
    ],

requireddocs: [
      'heritage imapct:missing',
      'Parking impact:missing',
      'neighbour Consultation:misssing '
    ],

    materials: [
      'Matching London stock brick',
      'Aluminum bi-fold doors',
      'Glass roof lantern',
      'Concrete foundation'
    ],
    planningNotes: 'Client requires completion before summer. Previous application refused due to height concerns - this design addresses those issues with reduced ridge height.'
  }
};

const mockMessages: Message[] = [
  {
    id: 'msg-001',
    projectId: mockProject.id,
    senderId: 'system',
    senderRole: 'agent_x',
    senderName: 'System',
    messageType: 'system',
    content: 'Project created and ready for assignment',
    timestamp: new Date('2024-02-13T09:30:00'),
    readBy: ['ax-001']
  }
];

const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    projectId: mockProject.id,
    filename: 'site-location-plan.pdf',
    category: 'site_plans',
    version: 1,
    uploadedBy: 'ax-001',
    uploadedByRole: 'agent_x',
    uploadedAt: new Date('2024-02-13T09:35:00'),
    fileSize: 245000,
    status: 'approved'
  },
  {
    id: 'doc-002',
    projectId: mockProject.id,
    filename: 'existing-elevations.pdf',
    category: 'drawings',
    version: 1,
    uploadedBy: 'ax-001',
    uploadedByRole: 'agent_x',
    uploadedAt: new Date('2024-02-13T09:36:00'),
    fileSize: 512000,
    status: 'approved'
  }
];

const mockActivityLog: ActivityLogEntry[] = [
  {
    id: 'act-001',
    projectId: mockProject.id,
    timestamp: new Date('2024-02-13T09:30:00'),
    activityType: 'project_created',
    performedBy: 'ax-001',
    performedByRole: 'agent_x',
    description: 'Project created from user submission'
  },
  {
    id: 'act-002',
    projectId: mockProject.id,
    timestamp: new Date('2024-02-13T09:35:00'),
    activityType: 'document_uploaded',
    performedBy: 'ax-001',
    performedByRole: 'agent_x',
    description: 'Uploaded site-location-plan.pdf'
  }
];

// ============================================
// UTILITY COMPONENTS
// ============================================

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    clarification_requested: { label: 'Clarification Needed', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    awaiting_documents: { label: 'Awaiting Documents', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-300' },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500 border-gray-300' }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

const PrivacyIndicator: React.FC = () => (
  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
    <Shield className="w-4 h-4" />
    <span className="font-medium">Privacy Protected</span>
    <span className="text-green-600">• All personal data sanitized</span>
  </div>
);

// ============================================
// PROJECT HEADER COMPONENT
// ============================================

const ProjectHeader: React.FC<{ 
  project: Project; 
  currentUser: Agent;
}> = ({ project, currentUser }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.sanitizedData.projectId}</h1>
            <StatusBadge status={project.status} />
            {project.locked && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                Locked
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{project.sanitizedData.developmentPurpose}</p>
        </div>
        
        <PrivacyIndicator />
      </div>

      <div className="grid grid-cols-4 gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <div>
            <div className="text-xs text-gray-500">Created</div>
            <div className="font-medium text-gray-900">{formatDate(project.createdAt)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Building2 className="w-4 h-4" />
          <div>
            <div className="text-xs text-gray-500">Property Type</div>
            <div className="font-medium text-gray-900">{project.sanitizedData.propertyType}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <div>
            <div className="text-xs text-gray-500">Location</div>
            <div className="font-medium text-gray-900">{project.sanitizedData.postcode}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <User className="w-4 h-4" />
          <div>
            <div className="text-xs text-gray-500">Your Role</div>
            <div className="font-medium text-gray-900">
              {currentUser.role === 'agent_x' ? 'Project Coordinator' : 'Planning Specialist'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROJECT SUMMARY COMPONENT
// ============================================

const ProjectSummaryCard: React.FC<{ data: SanitizedProjectData }> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Project Summary
        </h2>
        <p className="text-sm text-gray-600 mt-1">Sanitized project data (safe for Agent Y)</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Property Overview */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Property Overview
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Property Type</div>
              <div className="text-sm font-medium text-gray-900">{data.propertyType}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Site Address</div>
              <div className="text-sm font-medium text-gray-900">{data.siteAddress}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Postcode</div>
              <div className="text-sm font-medium text-gray-900">{data.postcode}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Development Purpose</div>
              <div className="text-sm font-medium text-gray-900">{data.developmentPurpose}</div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-purple-600" />
            Dimensions
          </h3>
          <div className="grid grid-cols-4 gap-4 bg-purple-50 rounded-lg p-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Length</div>
              <div className="text-sm font-medium text-gray-900">
                {data.dimensions.length} {data.dimensions.units}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Width</div>
              <div className="text-sm font-medium text-gray-900">
                {data.dimensions.width} {data.dimensions.units}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Height</div>
              <div className="text-sm font-medium text-gray-900">
                {data.dimensions.height} {data.dimensions.units}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Units</div>
              <div className="text-sm font-medium text-gray-900 capitalize">{data.dimensions.units}</div>
            </div>
          </div>
        </div>

        {/* Constraints */}

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Site Constraints
          </h3>
          <ul className="space-y-2">
            {data.constraints.map((constraint, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 rounded-lg p-3">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
{/* required docs */}
<div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Required documents
          </h3>
          <ul className="space-y-2">
            {data.requireddocs.map((requireddocs, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-red-50 rounded-lg p-3">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{requireddocs}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Materials */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-green-600" />
            Proposed Materials
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {data.materials.map((material, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{material}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planning Notes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            Planning Notes
          </h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.planningNotes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ASSIGNMENT PANEL COMPONENT
// ============================================

const AssignmentPanel: React.FC<{
  project: Project;
  agents: Agent[];
  onAssign: (agentId: string, notes: string) => void;
}> = ({ project, agents, onAssign }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const handleAssign = () => {
    if (selectedAgent) {
      onAssign(selectedAgent, assignmentNotes);
      setAssignmentNotes('');
    }
  };

  const assignedAgent = agents.find(a => a.id === project.assignedToAgentY);

  if (project.assignedToAgentY) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Assignment Status
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900 mb-1">Assigned to Agent Y</div>
              <div className="text-lg font-semibold text-blue-700">{assignedAgent?.name}</div>
              {assignedAgent?.specialization && (
                <div className="text-xs text-blue-600 mt-1">
                  Specialization: {assignedAgent.specialization.join(', ')}
                </div>
              )}
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
          {project.assignedAt && (
            <div className="mt-3 text-xs text-blue-600">
              Assigned on {new Date(project.assignedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    );
  }

  // return (
  //   <div className="bg-white rounded-lg border border-gray-200 p-6">
  //     <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
  //       <Users className="w-5 h-5" />
  //       Assign to Agent Y
  //     </h2>

  //     <div className="space-y-4">
  //       <div>
  //         <label className="block text-sm font-medium text-gray-700 mb-2">
  //           Select Planning Specialist
  //         </label>
  //         <select
  //           value={selectedAgent}
  //           onChange={(e) => setSelectedAgent(e.target.value)}
  //           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  //         >
  //           <option value="">Choose an agent...</option>
  //           {agents.map(agent => (
  //             <option key={agent.id} value={agent.id}>
  //               {agent.name} - {agent.specialization?.join(', ')} ({agent.activeProjects} active projects)
  //             </option>
  //           ))}
  //         </select>
  //       </div>

  //       <div>
  //         <label className="block text-sm font-medium text-gray-700 mb-2">
  //           Internal Assignment Notes (Optional)
  //         </label>
  //         <textarea
  //           value={assignmentNotes}
  //           onChange={(e) => setAssignmentNotes(e.target.value)}
  //           placeholder="Add any internal notes for Agent Y about this project..."
  //           className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
  //         />
  //       </div>

  //       <button
  //         onClick={handleAssign}
  //         disabled={!selectedAgent}
  //         className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
  //       >
  //         <ArrowRight className="w-5 h-5" />
  //         Assign Project to Agent Y
  //       </button>
  //     </div>
  //   </div>
  // );
};

// ============================================
// CHAT SYSTEM COMPONENT
// ============================================

const ChatSystem: React.FC<{
  projectId: string;
  messages: Message[];
  currentUser: Agent;
  onSendMessage: (content: string, type: MessageType) => void;
}> = ({ projectId, messages, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showDocRequest, setShowDocRequest] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };

  const handleRequestDocument = () => {
    onSendMessage('Requesting additional site survey documentation', 'document_request');
    setShowDocRequest(false);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-[600px]">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Internal Chat (Agent X ↔ Agent Y)
        </h2>
        <p className="text-sm text-gray-600 mt-1">Secure internal communication - not visible to users</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser.id;
          const isSystem = message.messageType === 'system';

          if (isSystem) {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {message.senderName}
                  </span>
                  <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                </div>
                <div
                  className={`rounded-lg px-4 py-3 ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.messageType === 'document_request' && (
                    <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                      <FileText className="w-3.5 h-3.5" />
                      Document Request
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowDocRequest(!showDocRequest)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Request document"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {showDocRequest && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-sm font-medium text-amber-900 mb-2">Request Document</div>
            <button
              onClick={handleRequestDocument}
              className="text-sm text-amber-700 hover:text-amber-900 underline"
            >
              Request additional site survey documentation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// DOCUMENT MANAGEMENT COMPONENT
// ============================================

const DocumentPanel: React.FC<{
  documents: Document[];
  currentUser: Agent;
  onUpload: (category: DocumentCategory) => void;
}> = ({ documents, currentUser, onUpload }) => {
  const categories: { key: DocumentCategory; label: string; icon: any }[] = [
    { key: 'drawings', label: 'Drawings', icon: FileText },
    { key: 'site_plans', label: 'Site Plans', icon: MapPin },
    { key: 'reports', label: 'Reports', icon: FileCheck },
    { key: 'clarifications', label: 'Clarifications', icon: MessageCircle },
    { key: 'supporting_docs', label: 'Supporting Documents', icon: FileText }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Management
        </h2>
        <p className="text-sm text-gray-600 mt-1">Shared project documents (sanitized metadata)</p>
      </div>

      <div className="p-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const categoryDocs = documents.filter(d => d.category === category.key);

          return (
            <div key={category.key} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  {category.label}
                  <span className="text-xs text-gray-500 font-normal">({categoryDocs.length})</span>
                </h3>
                <button
                  onClick={() => onUpload(category.key)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              </div>

              {categoryDocs.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {categoryDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {doc.filename}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Version {doc.version} • {formatFileSize(doc.fileSize)}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          by {doc.uploadedByRole === 'agent_x' ? 'Agent X' : 'Agent Y'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          doc.status === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doc.status === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-4 text-center">
                  No {category.label.toLowerCase()} uploaded yet
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// ACTIVITY TIMELINE COMPONENT
// ============================================

const ActivityTimeline: React.FC<{ activities: ActivityLogEntry[] }> = ({ activities }) => {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'project_created': return <FileText className="w-4 h-4" />;
      case 'assigned_to_agent': return <Users className="w-4 h-4" />;
      case 'status_changed': return <Activity className="w-4 h-4" />;
      case 'message_sent': return <MessageSquare className="w-4 h-4" />;
      case 'document_uploaded': return <Upload className="w-4 h-4" />;
      case 'document_approved': return <CheckCircle className="w-4 h-4" />;
      case 'document_requested': return <FileText className="w-4 h-4" />;
      case 'project_locked': return <Lock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Timeline
        </h2>
        <p className="text-sm text-gray-600 mt-1">Complete audit trail of all project actions</p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div key={activity.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.activityType)}
                </div>
                {idx < activities.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>
              
              <div className="flex-1 pb-4">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {activity.description}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(activity.timestamp)} • by {activity.performedByRole === 'agent_x' ? 'Agent X' : 'Agent Y'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// STATUS WORKFLOW COMPONENT
// ============================================

const StatusWorkflow: React.FC<{
  currentStatus: ProjectStatus;
  onStatusChange: (newStatus: ProjectStatus) => void;
  canEdit: boolean;
}> = ({ currentStatus, onStatusChange, canEdit }) => {
  const statuses: ProjectStatus[] = [
    'draft',
    'assigned',
    'under_review',
    'clarification_requested',
    'awaiting_documents',
    'completed'
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Project Status
      </h3>
      
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
        disabled={!canEdit}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {statuses.map(status => (
          <option key={status} value={status}>
            {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </option>
        ))}
      </select>
    </div>
  );
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================

const ProjectHandoverPage: React.FC = () => {
  const [project, setProject] = useState<Project>(mockProject);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(mockActivityLog);

  // Simulate current user as Agent X
  const currentUser: Agent = {
    id: 'ax-001',
    name: 'John Smith',
    role: 'agent_x',
    activeProjects: 12
  };

  const handleAssignToAgentY = (agentId: string, notes: string) => {
    const agent = mockAgentsY.find(a => a.id === agentId);
    if (!agent) return;

    const now = new Date();
    
    setProject({
      ...project,
      assignedToAgentY: agentId,
      assignedAt: now,
      status: 'assigned',
      locked: true,
      updatedAt: now
    });

    // Add system message
    const systemMessage: Message = {
      id: `msg-${Date.now()}`,
      projectId: project.id,
      senderId: 'system',
      senderRole: 'agent_x',
      senderName: 'System',
      messageType: 'system',
      content: `Project assigned to ${agent.name}`,
      timestamp: now,
      readBy: []
    };
    setMessages([...messages, systemMessage]);

    // Add assignment note if provided
    if (notes) {
      const noteMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        projectId: project.id,
        senderId: currentUser.id,
        senderRole: 'agent_x',
        senderName: currentUser.name,
        messageType: 'text',
        content: `Assignment notes: ${notes}`,
        timestamp: now,
        readBy: []
      };
      setMessages(prev => [...prev, noteMessage]);
    }

    // Add activity log
    const activity: ActivityLogEntry = {
      id: `act-${Date.now()}`,
      projectId: project.id,
      timestamp: now,
      activityType: 'assigned_to_agent',
      performedBy: currentUser.id,
      performedByRole: 'agent_x',
      description: `Assigned project to ${agent.name}`
    };
    setActivityLog([...activityLog, activity]);
  };

  const handleSendMessage = (content: string, type: MessageType) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      projectId: project.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      senderName: currentUser.name,
      messageType: type,
      content,
      timestamp: new Date(),
      readBy: [currentUser.id]
    };

    setMessages([...messages, newMessage]);

    const activity: ActivityLogEntry = {
      id: `act-${Date.now()}`,
      projectId: project.id,
      timestamp: new Date(),
      activityType: type === 'document_request' ? 'document_requested' : 'message_sent',
      performedBy: currentUser.id,
      performedByRole: currentUser.role,
      description: type === 'document_request' 
        ? `Requested document: ${content}`
        : 'Sent message in internal chat'
    };
    setActivityLog([...activityLog, activity]);
  };

  const handleDocumentUpload = (category: DocumentCategory) => {
    // Simulate file upload
    const now = new Date();
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      projectId: project.id,
      filename: `new-${category}-${Date.now()}.pdf`,
      category,
      version: 1,
      uploadedBy: currentUser.id,
      uploadedByRole: currentUser.role,
      uploadedAt: now,
      fileSize: 350000,
      status: 'pending_review'
    };

    setDocuments([...documents, newDoc]);

    const activity: ActivityLogEntry = {
      id: `act-${Date.now()}`,
      projectId: project.id,
      timestamp: now,
      activityType: 'document_uploaded',
      performedBy: currentUser.id,
      performedByRole: currentUser.role,
      description: `Uploaded ${newDoc.filename} to ${category}`
    };
    setActivityLog([...activityLog, activity]);
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    const now = new Date();
    const oldStatus = project.status;
    
    setProject({
      ...project,
      status: newStatus,
      updatedAt: now
    });

    const activity: ActivityLogEntry = {
      id: `act-${Date.now()}`,
      projectId: project.id,
      timestamp: now,
      activityType: 'status_changed',
      performedBy: currentUser.id,
      performedByRole: currentUser.role,
      description: `Changed status from ${oldStatus} to ${newStatus}`
    };
    setActivityLog([...activityLog, activity]);

    const statusMessage: Message = {
      id: `msg-${Date.now()}`,
      projectId: project.id,
      senderId: 'system',
      senderRole: 'agent_x',
      senderName: 'System',
      messageType: 'status_update',
      content: `Project status updated to: ${newStatus.replace(/_/g, ' ')}`,
      timestamp: now,
      readBy: [],
      metadata: {
        statusChange: { from: oldStatus, to: newStatus }
      }
    };
    setMessages([...messages, statusMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader project={project} currentUser={currentUser} />

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Left Column - Project Summary & Assignment */}
          <div className="col-span-2 space-y-6">
            <ProjectSummaryCard data={project.sanitizedData} />
            
            <AssignmentPanel
              project={project}
              agents={mockAgentsY}
              onAssign={handleAssignToAgentY}
            />

            {/* <DocumentPanel
              documents={documents}
              currentUser={currentUser}
              onUpload={handleDocumentUpload}
            /> */}
          </div>

          {/* Right Column - Chat & Activity */}
          {/* <div className="space-y-6">
            <StatusWorkflow
              currentStatus={project.status}
              onStatusChange={handleStatusChange}
              canEdit={project.assignedToAgentY !== null}
            />

            <ChatSystem
              projectId={project.id}
              messages={messages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
            />

            <ActivityTimeline activities={activityLog} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProjectHandoverPage;