import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Course, CourseModule, QuizQuestion, LibraryResource, StudyGroup, UserProfile, LessonNote, ChatMessage } from './types';
import { authService } from './services/authService';
import { generateCoursePlan, generateLessonContent, generateQuiz, processVoiceCommand, askAboutContext, getCurriculumRecommendations, generateLibraryResources, analyzeVideo, askComplexQuery, generateSpeech, transcribeAudio, getExploreCourseSuggestions } from './services/geminiService';
import { blobToBase64, decodeAudioData, base64ToUint8Array } from './utils';
import { LiveTeacher } from './components/LiveTeacher';
import { parse } from 'marked';
import {
    BookOpenIcon,
    VideoCameraIcon,
    AcademicCapIcon,
    ChartBarIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    MicrophoneIcon,
    StopIcon,
    SparklesIcon,
    TrophyIcon,
    BoltIcon,
    FireIcon,
    ClockIcon,
    BookmarkIcon,
    PlayIcon,
    DocumentTextIcon,
    UserGroupIcon,
    PlusIcon,
    UsersIcon,
    CodeBracketIcon,
    PencilSquareIcon,
    EyeIcon,
    EyeSlashIcon,
    ChatBubbleLeftRightIcon,
    PencilIcon,
    TrashIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    BuildingLibraryIcon,
    BeakerIcon,
    SpeakerWaveIcon,
    CpuChipIcon,
    ArrowUpTrayIcon,
    PhotoIcon,
    CommandLineIcon
} from '@heroicons/react/24/solid';

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${active
            ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 translate-x-1'
            : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800'
            }`}
    >
        <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
        <span className="font-semibold tracking-wide text-sm">{label}</span>
    </button>
);

const StatCard = ({ label, value, sub, color, icon: Icon }: any) => (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 ${color} -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-500`}></div>

        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
        <p className="text-slate-500 text-xs font-medium mt-3 flex items-center gap-1">
            <span className="text-green-500 font-bold">↑</span>
            {sub}
        </p>
    </div>
);

const Hero = ({ onStart, user }: { onStart: () => void, user: UserProfile }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: 0, y: 0 });
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full bg-slate-900 rounded-[2.5rem] p-8 md:p-14 overflow-hidden shadow-2xl mb-12 group isolate perspective-1000"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-950 z-0"></div>

            <div
                className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] transition-transform duration-500 ease-out pointer-events-none mix-blend-screen"
                style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
            ></div>
            <div
                className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] transition-transform duration-500 ease-out pointer-events-none mix-blend-screen"
                style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
            ></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                <div className="text-white max-w-xl space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 text-brand-100 shadow-xl animate-fade-in uppercase tracking-wide">
                        <SparklesIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span>AI-Powered Learning Revolution</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                        One Student. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 animate-gradient-x">
                            One Path.
                        </span>
                    </h1>

                    <p className="text-slate-300 text-lg leading-relaxed max-w-md font-light">
                        Your personal AI tutor that adapts to your unique learning style in real-time.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={onStart}
                            className="relative overflow-hidden bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all transform hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] active:scale-95 flex items-center gap-3 group/btn"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            <AcademicCapIcon className="w-6 h-6 text-brand-600 group-hover/btn:scale-110 transition-transform relative z-10" />
                            <span className="relative z-10">Start Learning</span>
                        </button>
                        <button className="px-8 py-4 rounded-2xl font-semibold text-white border border-white/10 hover:bg-white/5 hover:border-white/20 transition backdrop-blur-sm flex items-center gap-2">
                            <VideoCameraIcon className="w-5 h-5 text-slate-400" />
                            <span>Live Demo</span>
                        </button>
                    </div>
                </div>

                <div
                    className="hidden md:block relative w-96 h-[32rem] transition-transform duration-200 ease-out"
                    style={{
                        transform: `rotateY(${mousePos.x * 8}deg) rotateX(${mousePos.y * -8}deg)`,
                        transformStyle: 'preserve-3d'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col items-center pt-12 pb-8">

                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-brand-400 to-purple-500 p-[2px] shadow-2xl mb-6 ring-4 ring-white/10" style={{ transform: 'translateZ(20px)' }}>
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-5xl grayscale-[0.2] overflow-hidden">
                                {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.avatar || '👨‍🎓'
                                )}
                            </div>
                        </div>

                        <div className="text-center space-y-1 mb-10" style={{ transform: 'translateZ(30px)' }}>
                            <h3 className="text-2xl font-bold text-white tracking-tight">{user.name}</h3>
                            <p className="text-brand-200 text-sm font-medium tracking-wide">{user.level} Scholar</p>
                            <p className="text-slate-400 text-xs mt-1">{user.grade} • {user.fieldOfStudy}</p>
                        </div>

                        <div className="w-full px-10 space-y-6" style={{ transform: 'translateZ(10px)' }}>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-brand-100 mb-2 uppercase tracking-wider">
                                    <span>Physics</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[85%] rounded-full shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse-slow"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-brand-100 mb-2 uppercase tracking-wider">
                                    <span>Calculus</span>
                                    <span>42%</span>
                                </div>
                                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 w-[42%] rounded-full shadow-[0_0_15px_rgba(96,165,250,0.6)] animate-pulse-slow"></div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute top-8 right-8 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-md border border-yellow-500/30 p-3 rounded-2xl shadow-lg animate-float"
                            style={{ transform: `translateZ(60px)` }}
                        >
                            <TrophyIcon className="w-7 h-7 text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                        </div>

                        <div
                            className="absolute bottom-12 left-8 bg-gradient-to-br from-purple-400/20 to-pink-500/20 backdrop-blur-md border border-purple-500/30 p-3 rounded-2xl shadow-lg animate-float"
                            style={{ transform: `translateZ(40px)`, animationDelay: '1s' }}
                        >
                            <BoltIcon className="w-7 h-7 text-purple-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                        </div>
                    </div>

                    <div className="absolute -inset-10 bg-brand-500/20 rounded-[3rem] blur-3xl -z-10 opacity-60" style={{ transform: 'translateZ(-50px)' }}></div>
                </div>
            </div>
        </div>
    );
};

const SimpleCourseCard: React.FC<{ course: Course; onClick: () => void }> = ({ course, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-2 relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <AcademicCapIcon className="w-32 h-32 text-brand-600" />
        </div>

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3.5 bg-brand-50 rounded-2xl text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <BookOpenIcon className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
                {course.progress}% Complete
            </span>
        </div>

        <div className="relative z-10">
            <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight group-hover:text-brand-600 transition-colors">{course.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">{course.description}</p>

            <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${course.progress}%` }}></div>
                </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">{course.modules.length} Modules</p>
        </div>
    </div>
);

const DetailedCourseCard: React.FC<{ course: Course; onClick: () => void }> = ({ course, onClick }) => (
    <div
        onClick={onClick}
        className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-1 overflow-hidden flex flex-col h-full"
    >
        {/* Header Image Area */}
        <div className={`h-40 bg-gradient-to-br ${course.imageGradient || 'from-slate-700 to-slate-900'} relative p-5 flex flex-col justify-between`}>
            <span className="self-start px-2 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-lg border border-white/10">
                {course.category || 'General'}
            </span>

            <div className="absolute right-4 top-4 opacity-20">
                <CodeBracketIcon className="w-24 h-24 text-white transform rotate-12" />
            </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-4 leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
                {course.title}
            </h3>

            <div className="mb-6">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}% Complete</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full" style={{ width: `${course.progress}%` }}></div>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-50 pt-3">
                    <p>Instructor: <span className="font-semibold text-slate-700">{course.instructor || 'AI Tutor'}</span></p>
                    <p>Duration: <span className="font-semibold text-slate-700">{course.duration || 'Flexible'}</span></p>
                </div>

                <button className="w-full py-2 rounded-lg text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors">
                    Continue Learning
                </button>
            </div>
        </div>
    </div>
);

const LibraryCard: React.FC<{ resource: LibraryResource, onSave: (id: string) => void, onView: (r: LibraryResource) => void }> = ({ resource, onSave, onView }) => (
    <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full">
        {/* Thumbnail */}
        <div className={`h-40 w-full rounded-2xl bg-gradient-to-br ${resource.thumbnailGradient || 'from-slate-700 to-slate-900'} relative overflow-hidden mb-4 flex items-center justify-center shrink-0`}>
            {resource.type === 'Video' && (
                <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform cursor-pointer" onClick={() => onView(resource)}>
                    <PlayIcon className="w-6 h-6 ml-0.5" />
                </div>
            )}
            {resource.type === 'Book' && <BookOpenIcon className="w-16 h-16 text-white/30" />}
            {resource.type === 'Article' && <DocumentTextIcon className="w-16 h-16 text-white/30" />}

            {/* Type Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                {resource.type}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2">{resource.title}</h3>
            <p className="text-slate-400 text-sm font-medium mb-2">{resource.author}</p>
            {resource.description && <p className="text-slate-500 text-xs line-clamp-2 mb-4">{resource.description}</p>}

            <div className="mt-auto flex items-center gap-2">
                <button
                    onClick={() => onView(resource)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${resource.type === 'Video'
                        ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/25 shadow-lg'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                        }`}>
                    {resource.type === 'Video' ? 'Watch' : 'Read Now'}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onSave(resource.id); }}
                    className={`p-2.5 rounded-xl border transition-all ${resource.isSaved
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-500'
                        : 'border-slate-200 text-slate-400 hover:text-brand-500 hover:border-brand-200 hover:bg-white'
                        }`}
                >
                    <BookmarkIcon className={`w-5 h-5 ${resource.isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    </div>
);

const StudyGroupCard: React.FC<{ group: StudyGroup }> = ({ group }) => (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl ${group.color} bg-opacity-10 flex items-center justify-center text-2xl shadow-inner`}>
                {group.icon}
            </div>
        </div>

        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">{group.title}</h3>

        <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
            <div className="flex-1 items-center gap-1 flex">
                <UsersIcon className="w-4 h-4 text-slate-400" />
                <span>{group.memberCount} members</span>
            </div>
        </div>

        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-6">{group.category}</p>

        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 active:scale-95 ${group.isMember
            ? 'bg-white border-2 border-slate-100 text-slate-600 hover:border-brand-500 hover:text-brand-600'
            : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}>
            {group.isMember ? 'View Group' : 'Join Group'}
        </button>
    </div>
);

// --- Main App Component ---

const App = () => {
    // Initial User Profile with Zero Stats (Default / Guest)
    const initialUser: UserProfile = {
        name: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        level: "Level 1",
        xp: 0,
        avatar: "👨‍🎓",
        role: "Student",
        learningGoal: 45,
        style: "Visual",
        totalHours: 0,
        coursesCompleted: 0,
        averageScore: 0,
        streak: 0,
        educationLevel: "School (Grade 1-10)",
        grade: "10th Grade",
        fieldOfStudy: "General"
    };

    const [user, setUser] = useState<UserProfile>(initialUser);
    const [view, setView] = useState<ViewState>(ViewState.LOGIN);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [activeModule, setActiveModule] = useState<CourseModule | null>(null);
    const [lessonContent, setLessonContent] = useState<string>("");
    const [lessonHtml, setLessonHtml] = useState<string>("");
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzingVoice, setAnalyzingVoice] = useState(false);
    const [formData, setFormData] = useState({ topic: "", level: "Beginner", style: "Visual" });
    const [isRecording, setIsRecording] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [showPassword, setShowPassword] = useState(false);

    // Interactive Lesson State
    const [notes, setNotes] = useState<LessonNote[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<'notes' | 'chat'>('notes');
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
    const [selectedText, setSelectedText] = useState<string>("");
    const [chatInput, setChatInput] = useState("");
    const [isAiTyping, setIsAiTyping] = useState(false);

    // Education Recommendations State
    const [eduRecommendations, setEduRecommendations] = useState<{ title: string, description: string }[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(false);

    // Library State
    const [libraryResources, setLibraryResources] = useState<LibraryResource[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [activeLibraryTab, setActiveLibraryTab] = useState<'all' | 'saved' | 'history'>('all');
    const [viewedHistory, setViewedHistory] = useState<string[]>([]); // Array of IDs
    const [libraryStreamInput, setLibraryStreamInput] = useState("");

    // AI Lab State
    const [activeAILabTab, setActiveAILabTab] = useState<'video' | 'thinking' | 'tts' | 'transcribe' | 'live'>('video');
    const [videoAnalysisResult, setVideoAnalysisResult] = useState<string>("");
    const [thinkingResult, setThinkingResult] = useState<string>("");
    const [ttsText, setTtsText] = useState<string>("");
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [transcriptionResult, setTranscriptionResult] = useState<string>("");
    const [labLoading, setLabLoading] = useState(false);
    const [complexQuery, setComplexQuery] = useState("");
    const [videoPrompt, setVideoPrompt] = useState("Describe what's happening in this video in detail.");

    // Quiz State
    const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [showQuizResult, setShowQuizResult] = useState(false);
    const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

    // Auth Form State
    const [authForm, setAuthForm] = useState({
        name: '',
        email: '',
        password: '',
        educationLevel: 'School (Grade 1-10)',
        grade: '',
        fieldOfStudy: ''
    });

    // Details Form State
    const [detailsForm, setDetailsForm] = useState<UserProfile>(user);

    // Profile Update State
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const lessonContainerRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize Data & Check Auth
    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            try {
                const profile = await authService.getProfile();
                if (profile) {
                    setUser(profile);
                    setView(ViewState.DASHBOARD);
                    fetchExploreCourses(profile);
                }
            } catch (e) {
                console.error("Auth check failed", e);
            }
        };
        checkAuth();

        // Initial mock data, will be replaced by AI suggestions after login
        const mockCourses: Course[] = [];
        setAllCourses(mockCourses);
    }, []);

    // Sync Details Form with User state when entering MY_DETAILS view
    useEffect(() => {
        if (view === ViewState.MY_DETAILS) {
            setDetailsForm(user);
        }
    }, [view, user]);

    // Fetch library resources when entering Library view or when Stream/Grade changes
    useEffect(() => {
        if (view === ViewState.MY_LIBRARY && libraryResources.length === 0) {
            fetchLibraryResources();
        }
    }, [view]);

    const fetchLibraryResources = async (userOverride?: UserProfile) => {
        const u = userOverride || user;
        setLoadingLibrary(true);
        // Combine grade and field for better context
        const query = `${u.grade} ${u.fieldOfStudy || "General"}`;
        const resources = await generateLibraryResources(query);
        // Add gradients and IDs
        const gradients = [
            'from-slate-800 to-black', 'from-blue-900 to-slate-900', 'from-orange-300 to-orange-500',
            'from-zinc-100 to-zinc-300', 'from-blue-100 to-blue-200', 'from-slate-700 to-slate-800',
            'from-sky-100 to-sky-200', 'from-cyan-400 to-blue-500'
        ];

        const enhancedResources = resources.map((res: any, idx: number) => ({
            ...res,
            id: `gen-${Date.now()}-${idx}`,
            thumbnailGradient: gradients[idx % gradients.length],
            isSaved: false
        }));

        setLibraryResources(enhancedResources);
        setLoadingLibrary(false);
    };

    const fetchExploreCourses = async (u: UserProfile) => {
        setLoadingCourses(true);
        try {
            const suggestions = await getExploreCourseSuggestions(u);
            const newCourses: Course[] = suggestions.map((s: any, idx: number) => ({
                id: `explore-${idx}`,
                title: s.title,
                description: s.description,
                modules: [],
                progress: 0,
                category: s.category,
                instructor: 'NCERT AI',
                duration: 'Academic Year',
                imageGradient: ['from-indigo-900 to-blue-900', 'from-emerald-800 to-teal-900', 'from-slate-800 to-gray-900'][idx % 3]
            }));
            setAllCourses(newCourses);
        } catch (e) {
            console.error("Failed to fetch explore courses", e);
        }
        setLoadingCourses(false);
    };

    // Mock Study Groups Data
    const studyGroups: StudyGroup[] = [
        { id: '1', title: 'Web Dev Wizards', memberCount: 35, category: 'Subject Area', icon: '💻', isMember: false, color: 'bg-blue-500' },
        { id: '2', title: 'Data Science Collective', memberCount: 11, category: 'Lecture', icon: '📊', isMember: false, color: 'bg-indigo-500' },
        { id: '3', title: 'Art History Enthusiasts', memberCount: 36, category: 'Journal', icon: '🎨', isMember: false, color: 'bg-orange-500' },
        { id: '4', title: 'Design Principles Club', memberCount: 3, category: 'Article', icon: '🐍', isMember: true, color: 'bg-blue-400' },
        { id: '5', title: 'Data History Enthusiasts', memberCount: 18, category: 'E-Book', icon: '📜', isMember: false, color: 'bg-slate-800' },
        { id: '6', title: 'Design Principles Club', memberCount: 13, category: 'Subject Area', icon: '🖌️', isMember: true, color: 'bg-yellow-600' },
        { id: '7', title: 'Design Principles Club', memberCount: 16, category: 'Subject Area', icon: '📐', isMember: true, color: 'bg-yellow-500' },
        { id: '8', title: 'Python Principles Club', memberCount: 7, category: 'Subject Area', icon: '✨', isMember: true, color: 'bg-emerald-500' },
    ];

    // -- Handlers --

    const handleVoiceInput = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const base64 = await blobToBase64(audioBlob);
                    setAnalyzingVoice(true);
                    const result = await processVoiceCommand(base64);
                    if (result) {
                        setFormData(prev => ({
                            ...prev,
                            topic: result.topic || prev.topic,
                            level: result.level || prev.level,
                            style: result.style || prev.style
                        }));
                    }
                    setAnalyzingVoice(false);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error(err);
                alert("Could not access microphone.");
            }
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const plan = await generateCoursePlan(formData.topic, formData.level, formData.style);
            const newCourse: Course = {
                id: Date.now().toString(),
                title: plan.title,
                description: plan.description,
                modules: plan.modules.map((m: any, idx: number) => ({ ...m, id: idx.toString(), isCompleted: false })),
                progress: 0,
                category: formData.topic,
                instructor: 'AI Tutor',
                duration: 'Self-Paced',
                imageGradient: 'from-brand-600 to-blue-900'
            };
            setCourses(prev => [...prev, newCourse]);
            // Note: We don't necessarily want to add user created course to "Explore" list which is recommendations
            setView(ViewState.COURSES);
            setFormData({ topic: "", level: "Beginner", style: "Visual" });
        } catch (err) {
            alert("Failed to generate. Check API Key.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModule = async (course: Course, module: CourseModule) => {
        setActiveCourse(course);
        setActiveModule(module);
        setLoading(true);
        setView(ViewState.LESSON_VIEW);
        setChatHistory([]); // Reset chat

        // Load persisted notes
        const savedNotes = localStorage.getItem(`notes_${course.id}_${module.id}`);
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        } else {
            setNotes([]);
        }

        // Reset or set content
        let content = module.content;
        if (!content) {
            content = await generateLessonContent(module.title, course.title);

            // SAFE UPDATE: Create shallow copy of courses and modules to avoid undefined errors
            setCourses(prev => prev.map(c => {
                if (c.id === course.id) {
                    const updatedModules = [...c.modules];
                    const modIndex = updatedModules.findIndex(m => m.id === module.id);

                    if (modIndex > -1) {
                        updatedModules[modIndex] = { ...updatedModules[modIndex], content: content };
                    } else {
                        // For placeholder/demo modules
                        updatedModules.push({ ...module, content: content });
                    }
                    return { ...c, modules: updatedModules };
                }
                return c;
            }));
        }

        setLessonContent(content || "");
        try {
            const html = await parse(content || "");
            setLessonHtml(html);
        } catch (e) {
            setLessonHtml(content || ""); // Fallback
        }

        setLoading(false);
    };

    const handleStartQuiz = async () => {
        if (!lessonContent) return;
        setLoading(true);
        const questions = await generateQuiz(lessonContent);
        setQuizQuestions(questions);

        // Reset Quiz State
        setCurrentQuizQuestion(0);
        setQuizScore(0);
        setShowQuizResult(false);
        setSelectedQuizOption(null);

        setLoading(false);
        setView(ViewState.QUIZ);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let loggedInUser;
            if (authMode === 'signup') {
                const isSchool = authForm.educationLevel === 'School (Grade 1-10)';
                const signupData = {
                    name: authForm.name,
                    email: authForm.email,
                    password: authForm.password,
                    educationLevel: authForm.educationLevel,
                    grade: authForm.grade,
                    fieldOfStudy: isSchool ? 'General' : authForm.fieldOfStudy
                };
                loggedInUser = await authService.signup(signupData);
            } else {
                loggedInUser = await authService.login({
                    email: authForm.email,
                    password: authForm.password
                });
            }

            setUser(loggedInUser);
            setView(ViewState.DASHBOARD);

            // Fetch initial data
            setLoadingRecommendations(true);
            try {
                const recs = await getCurriculumRecommendations(loggedInUser.educationLevel, loggedInUser.grade, loggedInUser.fieldOfStudy);
                setEduRecommendations(recs);
                fetchLibraryResources(loggedInUser);
                fetchExploreCourses(loggedInUser);
            } catch (e) {
                console.log("Failed to load initial recs");
            }
            setLoadingRecommendations(false);

        } catch (error: any) {
            alert(error.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        try {
            const newUser = { ...detailsForm };
            // Optimistic update
            setUser(newUser);
            setShowSuccessMessage(true);

            // Backend update
            await authService.updateProfile(newUser);

            // Refresh content based on new details
            setLoadingRecommendations(true);
            const recs = await getCurriculumRecommendations(newUser.educationLevel, newUser.grade, newUser.fieldOfStudy);
            setEduRecommendations(recs);
            fetchLibraryResources(newUser);
            fetchExploreCourses(newUser);
            setLoadingRecommendations(false);

            // Auto-redirect after 1.5 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
                setView(ViewState.DASHBOARD);
            }, 1500);
        } catch (e) {
            console.error("Failed to update profile", e);
            alert("Failed to save details");
        }
    };

    const handleUpdateLibraryStream = () => {
        if (libraryStreamInput.trim()) {
            setUser(prev => ({ ...prev, fieldOfStudy: libraryStreamInput }));
            setTimeout(fetchLibraryResources, 100);
        }
    };

    const handleViewResource = (resource: LibraryResource) => {
        // 1. Open Link
        if (resource.link && resource.link !== '#') {
            window.open(resource.link, '_blank');
        }

        // 2. Track Stats
        setUser(prev => ({
            ...prev,
            totalHours: Number((prev.totalHours + 0.5).toFixed(1)), // Add 30 mins
            xp: prev.xp + 15,
            streak: prev.streak + 1 // Mock streak increment
        }));

        // 3. Add to History
        if (!viewedHistory.includes(resource.id)) {
            setViewedHistory(prev => [resource.id, ...prev]);
        }
    };

    const toggleSaveResource = (id: string) => {
        setLibraryResources(prev => prev.map(res =>
            res.id === id ? { ...res, isSaved: !res.isSaved } : res
        ));
    };

    const handleToggleModuleCompletion = () => {
        if (!activeCourse || !activeModule) return;

        const isNowComplete = !activeModule.isCompleted;

        // 1. Calculate new module state
        const updatedModules = activeCourse.modules.map(m =>
            m.id === activeModule.id ? { ...m, isCompleted: isNowComplete } : m
        );

        // 2. Calculate new course progress
        const completedCount = updatedModules.filter(m => m.isCompleted).length;
        const progress = Math.round((completedCount / updatedModules.length) * 100);

        const updatedCourse = { ...activeCourse, modules: updatedModules, progress };

        // 3. Update global courses state
        setCourses(prev => prev.map(c => c.id === activeCourse.id ? updatedCourse : c));

        // 4. Update local active state to reflect UI changes immediately
        setActiveCourse(updatedCourse);
        setActiveModule(updatedModules.find(m => m.id === activeModule.id) || null);

        // 5. Award XP and update stats if completing
        if (isNowComplete) {
            setUser(prev => ({
                ...prev,
                xp: prev.xp + 50,
                coursesCompleted: progress === 100 ? prev.coursesCompleted + 1 : prev.coursesCompleted
            }));
        }
    };

    // --- Profile Avatar Handlers ---
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDetailsForm(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- AI Lab Handlers ---

    const handleAnalyzeVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLabLoading(true);
        setVideoAnalysisResult("");

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            // Extract base64 part
            const base64Data = base64String.split(',')[1];
            const result = await analyzeVideo(base64Data, file.type, videoPrompt);
            setVideoAnalysisResult(result);
            setLabLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleThinkingQuery = async () => {
        if (!complexQuery.trim()) return;
        setLabLoading(true);
        setThinkingResult("");
        const result = await askComplexQuery(complexQuery);
        setThinkingResult(result);
        setLabLoading(false);
    };

    const handleGenerateSpeech = async () => {
        if (!ttsText.trim()) return;
        setLabLoading(true);
        const audioBase64 = await generateSpeech(ttsText);
        setLabLoading(false);

        if (audioBase64) {
            try {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                const ctx = audioContextRef.current;
                const audioBytes = base64ToUint8Array(audioBase64);
                const audioBuffer = await decodeAudioData(audioBytes, ctx);

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => setIsPlayingAudio(false);

                setIsPlayingAudio(true);
                source.start();
            } catch (e) {
                console.error("Audio playback error", e);
                alert("Failed to play audio.");
            }
        } else {
            alert("Failed to generate speech.");
        }
    };

    const handleRecordTranscription = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];
                setTranscriptionResult("");

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    setLabLoading(true);
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const base64 = await blobToBase64(audioBlob);
                    const result = await transcribeAudio(base64, 'audio/webm');
                    setTranscriptionResult(result);
                    setLabLoading(false);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (e) {
                console.error(e);
                alert("Microphone access denied.");
            }
        }
    };


    // --- Interactive Lesson Handlers ---

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            setMenuPosition(null);
            return;
        }

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        // Check if selection is inside lesson container
        if (lessonContainerRef.current && lessonContainerRef.current.contains(range.commonAncestorContainer) && text.length > 0) {
            const rect = range.getBoundingClientRect();
            setMenuPosition({
                top: rect.top - 60, // Above the selection
                left: rect.left + (rect.width / 2) // Center menu
            });
            setSelectedText(text);
        } else {
            setMenuPosition(null);
        }
    };

    const handleHighlight = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        try {
            const span = document.createElement('span');
            span.className = "bg-yellow-200 text-slate-900 border-b-2 border-yellow-300 rounded px-1 box-decoration-clone";
            range.surroundContents(span);

            setMenuPosition(null);
            selection.removeAllRanges();

            if (lessonContainerRef.current) {
                setLessonHtml(lessonContainerRef.current.innerHTML);
            }
        } catch (e) {
            alert("For now, please select text within a single paragraph to highlight.");
        }
    };

    const handleAddNote = () => {
        if (!selectedText) return;
        handleHighlight(); // Visually highlight the text for the note
        const newNote: LessonNote = {
            id: Date.now().toString(),
            quote: selectedText,
            text: "",
            createdAt: Date.now()
        };
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        setSidebarMode('notes');
        setSidebarOpen(true);
        setMenuPosition(null);

        // Persist to local storage
        if (activeCourse && activeModule) {
            localStorage.setItem(`notes_${activeCourse.id}_${activeModule.id}`, JSON.stringify(updatedNotes));
        }
    };

    const handleAskSphere = () => {
        if (!selectedText) return;
        setChatHistory(prev => [
            ...prev,
            { id: Date.now().toString(), role: 'user', text: `Question about: "${selectedText}"` }
        ]);
        setSidebarMode('chat');
        setSidebarOpen(true);
        setMenuPosition(null);

        setChatInput(`Explain this concept: "${selectedText.substring(0, 50)}..."`);
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput("");
        setIsAiTyping(true);

        const context = selectedText || lessonContent;
        const answer = await askAboutContext(context, userMsg.text);

        setChatHistory(prev => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: 'model', text: answer }
        ]);
        setIsAiTyping(false);
    };

    const handleQuizOptionSelect = (index: number) => {
        setSelectedQuizOption(index);
    };

    const handleNextQuestion = () => {
        const correct = quizQuestions[currentQuizQuestion].correctIndex === selectedQuizOption;
        if (correct) setQuizScore(s => s + 1);

        if (currentQuizQuestion < quizQuestions.length - 1) {
            setCurrentQuizQuestion(q => q + 1);
            setSelectedQuizOption(null);
        } else {
            setShowQuizResult(true);
            // Update user stats
            setUser(prev => ({
                ...prev,
                xp: prev.xp + (correct ? 50 : 10) + (quizScore * 20),
                averageScore: Math.round(((prev.averageScore * prev.coursesCompleted) + ((quizScore + (correct ? 1 : 0)) / quizQuestions.length * 100)) / (prev.coursesCompleted + 1))
            }));
        }
    };

    // -- Render Functions ---

    const renderAuth = () => (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000"></div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/40 mb-4">L</div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to LearnSphere</h1>
                    <p className="text-slate-400">Your AI-powered personalized learning journey.</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    {authMode === 'signup' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                    placeholder="Name"
                                    value={authForm.name}
                                    onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1">Education Level</label>
                                <select
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                    value={authForm.educationLevel}
                                    onChange={e => setAuthForm({ ...authForm, educationLevel: e.target.value })}
                                >
                                    <option>School (Grade 1-10)</option>
                                    <option>Intermediate (Grade 11-12)</option>
                                    <option>Undergraduate</option>
                                    <option>Graduate</option>
                                    <option>Self-Taught</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-300 ml-1">Grade / Year</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                        placeholder="e.g. 10th Grade"
                                        value={authForm.grade}
                                        onChange={e => setAuthForm({ ...authForm, grade: e.target.value })}
                                    />
                                </div>

                                {authForm.educationLevel !== 'School (Grade 1-10)' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-300 ml-1">Field of Study</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                            placeholder="e.g. Science"
                                            value={authForm.fieldOfStudy}
                                            onChange={e => setAuthForm({ ...authForm, fieldOfStudy: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                            placeholder="you@example.com"
                            value={authForm.email}
                            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:bg-slate-800 transition"
                                placeholder="••••••••"
                                value={authForm.password}
                                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-slate-500 hover:text-white"
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all transform active:scale-95 mt-4"
                    >
                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                            className="text-brand-400 font-bold ml-2 hover:text-brand-300 transition"
                        >
                            {authMode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );

    const renderDashboard = () => {
        // Map recommended topics to Course-like objects for display
        const recommendedCourses = eduRecommendations.length > 0
            ? eduRecommendations.map((rec, idx) => ({
                id: `rec-${idx}`,
                title: rec.title,
                description: rec.description,
                modules: new Array(4).fill({}), // Mock modules for visual count
                progress: 0,
                category: user.fieldOfStudy,
                instructor: 'AI Tutor',
                duration: '4 Weeks',
                imageGradient: ['from-purple-900 to-indigo-900', 'from-blue-900 to-slate-900', 'from-emerald-900 to-teal-900'][idx % 3]
            }))
            : allCourses.slice(0, 4);

        return (
            <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
                <Hero onStart={() => setView(ViewState.COURSE_GENERATOR)} user={user} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Total Learning" value={`${user.totalHours}h`} sub="12% vs last week" color="bg-blue-500" icon={ClockIcon} />
                    <StatCard label="Courses Completed" value={user.coursesCompleted} sub="2 new this month" color="bg-purple-500" icon={AcademicCapIcon} />
                    <StatCard label="Current Streak" value={`${user.streak} Days`} sub="Keep it up!" color="bg-orange-500" icon={FireIcon} />
                    <StatCard label="Total XP" value={user.xp} sub="Level up soon" color="bg-emerald-500" icon={TrophyIcon} />
                </div>

                <div>
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Continue Learning</h2>
                        <button onClick={() => setView(ViewState.COURSES)} className="text-brand-600 font-bold text-sm hover:underline">View All</button>
                    </div>

                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {courses.map(course => (
                                <SimpleCourseCard
                                    key={course.id}
                                    course={course}
                                    onClick={() => handleOpenModule(course, course.modules[0])}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <BookOpenIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Courses</h3>
                            <p className="text-slate-500 mb-6">Start your first AI-generated course today.</p>
                            <button
                                onClick={() => setView(ViewState.COURSE_GENERATOR)}
                                className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition"
                            >
                                Generate Course
                            </button>
                        </div>
                    )}
                </div>

                {/* Recommended Courses Section */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recommended Learning Paths</h2>
                        {loadingRecommendations && <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {recommendedCourses.map((course: any) => (
                            <DetailedCourseCard
                                key={course.id}
                                course={course}
                                onClick={() => {
                                    // When clicking a recommendation, we treat it like generating a new course
                                    setFormData({ ...formData, topic: course.title });
                                    setView(ViewState.COURSE_GENERATOR);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Featured Library Resources Section */}
                {libraryResources.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight mt-12">New in Your Library</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {libraryResources.slice(0, 4).map(resource => (
                                <LibraryCard
                                    key={resource.id}
                                    resource={resource}
                                    onSave={toggleSaveResource}
                                    onView={handleViewResource}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderCourses = () => (
        <div className="max-w-7xl mx-auto animate-fade-in pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Explore Courses</h2>
                    <p className="text-slate-500 mt-1">Curated curriculum for <span className="font-semibold text-slate-700">{user.grade} • {user.educationLevel === 'School (Grade 1-10)' ? 'All Subjects' : user.fieldOfStudy}</span></p>
                </div>
                <button
                    onClick={() => setView(ViewState.COURSE_GENERATOR)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/20"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Course
                </button>
            </div>

            {loadingCourses ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-64 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm animate-pulse">
                            <div className="h-32 bg-slate-100 rounded-t-[1.5rem]"></div>
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allCourses.map(course => (
                        <DetailedCourseCard
                            key={course.id}
                            course={course}
                            onClick={() => {
                                // Logic to start this specific course suggestion
                                setFormData({ ...formData, topic: course.title });
                                setView(ViewState.COURSE_GENERATOR);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const renderCourseGenerator = () => (
        <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">Design Your Course</h2>
                <p className="text-slate-500 text-lg">Tell us what you want to learn, and our AI will structure a perfect curriculum.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                {analyzingVoice && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-brand-500 rounded-full animate-ping mb-4"></div>
                        <p className="text-xl font-bold text-brand-600 animate-pulse">Processing Voice...</p>
                    </div>
                )}

                <form onSubmit={handleCreateCourse} className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Topic</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition shadow-inner"
                                placeholder="e.g. Quantum Physics, Renaissance Art, Python"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={handleVoiceInput}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${isRecording
                                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:text-brand-500 hover:border-brand-200'
                                    }`}
                            >
                                {isRecording ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Level</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white transition appearance-none"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Style</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:border-brand-500 focus:bg-white transition appearance-none"
                                value={formData.style}
                                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                            >
                                <option>Visual</option>
                                <option>Theoretical</option>
                                <option>Practical</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-1 transition-all transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Generating Syllabus...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6" />
                                <span>Generate Course</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );

    const renderLessonView = () => (
        <div className="flex h-full relative" ref={lessonContainerRef}>
            <div className={`flex-1 overflow-y-auto p-8 md:p-12 transition-all duration-300 ${sidebarOpen ? 'mr-96' : ''}`}>
                <button onClick={() => setView(ViewState.COURSES)} className="mb-6 flex items-center text-slate-500 hover:text-brand-600 transition font-bold text-sm">
                    <ChevronRightIcon className="w-4 h-4 rotate-180 mr-1" />
                    Back to Courses
                </button>

                <div className="max-w-3xl mx-auto">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <h1 className="text-4xl font-bold text-slate-900 leading-tight">{activeModule?.title}</h1>
                        <button
                            onClick={handleToggleModuleCompletion}
                            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${activeModule?.isCompleted
                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-brand-500 hover:text-brand-600'
                                }`}
                        >
                            {activeModule?.isCompleted ? (
                                <>
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    <span>Completed</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-brand-500"></div>
                                    <span>Mark Complete</span>
                                </>
                            )}
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-6 animate-pulse">
                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                            <div className="h-64 bg-slate-50 rounded-2xl my-8"></div>
                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                        </div>
                    ) : (
                        <div
                            className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-brand-600 prose-img:rounded-2xl prose-img:shadow-lg"
                            onMouseUp={handleTextSelection}
                            dangerouslySetInnerHTML={{ __html: lessonHtml }}
                        />
                    )}

                    <div className="mt-16 flex justify-between items-center border-t border-slate-100 pt-8">
                        <button className="text-slate-400 font-bold hover:text-slate-600 transition">Previous Module</button>
                        <button
                            onClick={handleStartQuiz}
                            className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/40 transition-all transform hover:-translate-y-1"
                        >
                            Take Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* Text Selection Menu */}
            {menuPosition && (
                <div
                    className="absolute z-50 bg-slate-900 text-white rounded-full shadow-2xl flex items-center overflow-hidden animate-bounce-in"
                    style={{ top: menuPosition.top, left: menuPosition.left, transform: 'translateX(-50%)' }}
                >
                    <button onClick={handleHighlight} className="p-3 hover:bg-white/10 transition" title="Highlight">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button onClick={handleAddNote} className="p-3 hover:bg-white/10 transition" title="Add Note">
                        <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button onClick={handleAskSphere} className="p-3 hover:bg-white/10 transition flex items-center gap-2 px-4" title="Ask AI">
                        <SparklesIcon className="w-4 h-4 text-brand-300" />
                        <span className="font-bold text-sm">Ask Sphere</span>
                    </button>
                </div>
            )}

            {/* Sidebar for Notes/Chat */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-40 border-l border-slate-100 flex flex-col ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button
                            onClick={() => setSidebarMode('notes')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${sidebarMode === 'notes' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => setSidebarMode('chat')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${sidebarMode === 'chat' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Sphere AI
                        </button>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sidebarMode === 'notes' ? (
                        notes.length > 0 ? notes.map(note => (
                            <div key={note.id} className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                <p className="text-yellow-800/60 text-xs font-bold uppercase mb-2">Quote</p>
                                <p className="text-slate-700 italic border-l-2 border-yellow-300 pl-3 mb-3 text-sm">"{note.quote}"</p>
                                <textarea
                                    className="w-full bg-transparent resize-none focus:outline-none text-slate-800 text-sm placeholder-yellow-800/40"
                                    placeholder="Add your thoughts..."
                                    value={note.text}
                                    onChange={(e) => {
                                        const updated = notes.map(n => n.id === note.id ? { ...n, text: e.target.value } : n);
                                        setNotes(updated);
                                        if (activeCourse && activeModule) localStorage.setItem(`notes_${activeCourse.id}_${activeModule.id}`, JSON.stringify(updated));
                                    }}
                                />
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 mt-10">
                                <PencilSquareIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Highlight text to add notes.</p>
                            </div>
                        )
                    ) : (
                        <>
                            {chatHistory.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-slate-800 text-white rounded-tr-none'
                                        : 'bg-brand-50 text-slate-800 rounded-tl-none border border-brand-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isAiTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-brand-50 p-3 rounded-2xl rounded-tl-none border border-brand-100 flex gap-1">
                                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {sidebarMode === 'chat' && (
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand-500"
                                placeholder="Ask Sphere..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!chatInput.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:bg-slate-300"
                            >
                                <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderQuiz = () => (
        <div className="max-w-2xl mx-auto py-12 px-6">
            {showQuizResult ? (
                <div className="bg-white rounded-[2rem] p-10 text-center shadow-xl border border-slate-100 animate-scale-in">
                    <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/30">
                        <TrophyIcon className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
                    <p className="text-slate-500 mb-8">You scored <span className="text-brand-600 font-bold text-xl">{quizScore} / {quizQuestions.length}</span></p>

                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setView(ViewState.LESSON_VIEW)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition">Review Lesson</button>
                        <button onClick={() => setView(ViewState.DASHBOARD)} className="px-6 py-3 rounded-xl font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition">Back to Dashboard</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question {currentQuizQuestion + 1} of {quizQuestions.length}</span>
                        <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">XP +20</span>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                        {quizQuestions[currentQuizQuestion]?.question}
                    </h2>

                    <div className="space-y-3">
                        {quizQuestions[currentQuizQuestion]?.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizOptionSelect(idx)}
                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${selectedQuizOption === idx
                                    ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-md'
                                    : 'border-slate-100 bg-white hover:border-brand-200 hover:bg-slate-50 text-slate-700'
                                    }`}
                            >
                                <span className="font-medium">{option}</span>
                                {selectedQuizOption === idx && <CheckCircleIcon className="w-6 h-6 text-brand-500" />}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleNextQuestion}
                        disabled={selectedQuizOption === null}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-slate-900/20"
                    >
                        {currentQuizQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            )}
        </div>
    );

    const renderLibrary = () => (
        <div className="max-w-7xl mx-auto pb-20 px-6 pt-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Resource Library</h2>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(['all', 'saved', 'history'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveLibraryTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${activeLibraryTab === tab ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stream Filter / Refresh Input */}
            <div className="mb-8 flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center max-w-2xl">
                <div className="bg-brand-50 p-2 rounded-lg text-brand-600">
                    <BuildingLibraryIcon className="w-6 h-6" />
                </div>
                <input
                    type="text"
                    className="flex-1 bg-transparent focus:outline-none font-medium text-slate-700 placeholder-slate-400"
                    placeholder={`Current focus: ${user.fieldOfStudy}. Type to change...`}
                    value={libraryStreamInput}
                    onChange={(e) => setLibraryStreamInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateLibraryStream()}
                />
                <button
                    onClick={handleUpdateLibraryStream}
                    className="text-sm font-bold text-brand-600 px-4 py-2 hover:bg-brand-50 rounded-lg transition"
                >
                    Update
                </button>
            </div>

            {loadingLibrary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-80 bg-white rounded-[1.5rem] border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {libraryResources
                        .filter(res => {
                            if (activeLibraryTab === 'saved') return res.isSaved;
                            if (activeLibraryTab === 'history') return viewedHistory.includes(res.id);
                            return true;
                        })
                        .map(resource => (
                            <LibraryCard
                                key={resource.id}
                                resource={resource}
                                onSave={toggleSaveResource}
                                onView={handleViewResource}
                            />
                        ))
                    }
                </div>
            )}
        </div>
    );

    const renderStudyGroups = () => (
        <div className="max-w-7xl mx-auto pb-20 px-6 pt-8 animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Study Groups</h2>
                <p className="text-slate-500 mt-2">Join a community of learners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {studyGroups.map(group => (
                    <StudyGroupCard key={group.id} group={group} />
                ))}
            </div>
        </div>
    );

    const renderMyDetails = () => (
        <div className="max-w-2xl mx-auto py-12 px-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 tracking-tight">My Profile</h2>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl relative overflow-hidden">
                {showSuccessMessage && (
                    <div className="absolute top-0 left-0 w-full bg-green-500 text-white text-center py-2 text-sm font-bold z-20">
                        Profile Updated Successfully!
                    </div>
                )}

                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-28 h-28 rounded-full bg-slate-100 mb-4 overflow-hidden cursor-pointer relative group border-4 border-white shadow-lg"
                        onClick={handleAvatarClick}
                    >
                        {detailsForm.avatar.startsWith('data:') || detailsForm.avatar.startsWith('http') ? (
                            <img src={detailsForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">{detailsForm.avatar}</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PencilIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                    <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                    <p className="text-slate-500">{user.email}</p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Name</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                                value={detailsForm.name}
                                onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Learning Goal (Mins/Day)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                                value={detailsForm.learningGoal}
                                onChange={(e) => setDetailsForm({ ...detailsForm, learningGoal: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Education Level</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                            value={detailsForm.educationLevel}
                            onChange={(e) => setDetailsForm({ ...detailsForm, educationLevel: e.target.value })}
                        >
                            <option>School (Grade 1-10)</option>
                            <option>Intermediate (Grade 11-12)</option>
                            <option>Undergraduate</option>
                            <option>Graduate</option>
                            <option>Self-Taught</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Grade</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                                value={detailsForm.grade}
                                onChange={(e) => setDetailsForm({ ...detailsForm, grade: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Field/Stream</label>
                            <input
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:border-brand-500"
                                value={detailsForm.fieldOfStudy}
                                onChange={(e) => setDetailsForm({ ...detailsForm, fieldOfStudy: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveDetails}
                        disabled={loadingRecommendations}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:opacity-50 flex justify-center gap-2"
                    >
                        {loadingRecommendations && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAILab = () => (
        <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-50 to-slate-50 z-0"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 px-6 pt-8 pb-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-brand-100 text-brand-600 rounded-xl">
                            <BeakerIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">AI Laboratory</h2>
                    </div>
                    <p className="text-slate-500 ml-14 mb-8">Experimental features powered by Gemini 2.5 & 3.0 Pro models.</p>

                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        {[
                            { id: 'video', label: 'Multimodal Vision', icon: VideoCameraIcon, color: 'text-blue-500' },
                            { id: 'thinking', label: 'Deep Reasoning', icon: CpuChipIcon, color: 'text-purple-500' },
                            { id: 'tts', label: 'Voice Synthesis', icon: SpeakerWaveIcon, color: 'text-orange-500' },
                            { id: 'transcribe', label: 'Speech to Text', icon: MicrophoneIcon, color: 'text-red-500' },
                            { id: 'live', label: 'Live Tutor', icon: UserGroupIcon, color: 'text-green-500' },
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeAILabTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveAILabTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${isActive
                                        ? 'bg-white border-brand-200 text-slate-800 shadow-lg shadow-brand-500/10 scale-105 ring-1 ring-brand-100'
                                        : 'bg-white/60 border-transparent text-slate-500 hover:bg-white hover:text-slate-700'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {activeAILabTab === 'video' && (
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 animate-fade-in">
                            <div className="text-center max-w-2xl mx-auto">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Multimodal Video Analysis</h3>
                                <p className="text-slate-500">Upload a video and let Gemini 1.5 Pro analyze it frame by frame.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-6">
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleAnalyzeVideo}
                                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                        />
                                        <div className="border-3 border-dashed border-slate-200 rounded-[2rem] p-12 text-center bg-slate-50 group-hover:bg-brand-50 group-hover:border-brand-300 transition-all duration-300">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-brand-500">
                                                <VideoCameraIcon className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold text-slate-700 text-lg mb-1">Upload Video</p>
                                            <p className="text-slate-400 text-sm">Drag & drop or click to browse</p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <SparklesIcon className="w-5 h-5 text-brand-500" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition"
                                            value={videoPrompt}
                                            onChange={(e) => setVideoPrompt(e.target.value)}
                                            placeholder="Ask a question about the video..."
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2rem] p-8 min-h-[300px] text-slate-300 font-mono text-sm leading-relaxed relative overflow-hidden">
                                    {labLoading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                                            <div className="w-12 h-12 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin mb-4"></div>
                                            <p className="animate-pulse font-bold text-brand-400">Analyzing Frames...</p>
                                        </div>
                                    ) : videoAnalysisResult ? (
                                        <div className="animate-fade-in whitespace-pre-wrap">{videoAnalysisResult}</div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <PhotoIcon className="w-12 h-12 mb-3 opacity-20" />
                                            <p>Analysis results will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeAILabTab === 'thinking' && (
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-1">Chain-of-Thought Reasoning</h3>
                                    <p className="text-slate-500">Solve complex problems with step-by-step logic.</p>
                                </div>
                                <div className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Gemini 3.0 Pro
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-6 font-medium text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 resize-none transition"
                                    placeholder="Enter a complex math problem, logic puzzle, or coding challenge..."
                                    value={complexQuery}
                                    onChange={(e) => setComplexQuery(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleThinkingQuery}
                                        disabled={labLoading}
                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {labLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CpuChipIcon className="w-5 h-5" />}
                                        Start Reasoning
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute top-0 left-0 bg-amber-100 text-amber-800 px-3 py-1 rounded-br-xl rounded-tl-2xl text-xs font-bold border-r border-b border-amber-200">
                                    Thinking Process
                                </div>
                                <div className="bg-[#fffbeb] text-slate-800 p-8 pt-10 rounded-[2rem] font-mono text-sm whitespace-pre-wrap border border-amber-100 min-h-[200px]">
                                    {thinkingResult ? thinkingResult : <span className="text-amber-800/40 italic">Model reasoning steps will be displayed here...</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeAILabTab === 'tts' && (
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 animate-fade-in max-w-3xl mx-auto">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Neural Text to Speech</h3>
                                <p className="text-slate-500">Generate human-like speech from any text input.</p>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-6 font-medium text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none transition"
                                    placeholder="Type something for the AI to say..."
                                    value={ttsText}
                                    onChange={(e) => setTtsText(e.target.value)}
                                />
                                <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-400">
                                    {ttsText.length} chars
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleGenerateSpeech}
                                    disabled={labLoading || isPlayingAudio}
                                    className={`h-16 px-8 rounded-full font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-xl ${isPlayingAudio
                                        ? 'bg-orange-100 text-orange-600 border-2 border-orange-200 cursor-default'
                                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30'
                                        }`}
                                >
                                    {isPlayingAudio ? (
                                        <>
                                            <div className="flex gap-1 h-4 items-end">
                                                <div className="w-1 bg-orange-500 animate-[bounce_1s_infinite] h-2"></div>
                                                <div className="w-1 bg-orange-500 animate-[bounce_1.2s_infinite] h-4"></div>
                                                <div className="w-1 bg-orange-500 animate-[bounce_0.8s_infinite] h-3"></div>
                                            </div>
                                            <span>Playing Audio...</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlayIcon className="w-6 h-6" />
                                            <span>Generate Speech</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeAILabTab === 'transcribe' && (
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 animate-fade-in max-w-3xl mx-auto text-center">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Real-time Transcription</h3>
                                <p className="text-slate-500">Speak naturally and see accurate text output instantly.</p>
                            </div>

                            <div className="relative py-8">
                                {isRecording && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping"></div>
                                        <div className="w-48 h-48 bg-red-500/10 rounded-full animate-ping delay-75"></div>
                                    </div>
                                )}
                                <button
                                    onClick={handleRecordTranscription}
                                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-300 shadow-2xl ${isRecording
                                        ? 'bg-red-500 text-white scale-110 shadow-red-500/40'
                                        : 'bg-white text-slate-400 border-4 border-slate-100 hover:border-brand-200 hover:text-brand-500'
                                        }`}
                                >
                                    {isRecording ? <StopIcon className="w-10 h-10" /> : <MicrophoneIcon className="w-10 h-10" />}
                                </button>
                                <p className={`mt-6 font-bold uppercase tracking-wider text-sm ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                    {isRecording ? 'Recording in progress...' : 'Tap to Start Recording'}
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2rem] text-left min-h-[150px] relative">
                                <div className="absolute top-4 left-6 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4" /> Transcript
                                </div>
                                <div className="mt-6 text-slate-700 text-lg leading-relaxed font-medium">
                                    {transcriptionResult || <span className="text-slate-300">Your speech text will appear here...</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeAILabTab === 'live' && (
                        <div className="h-[700px] bg-black rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-slate-900 relative">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-20"></div>
                            <LiveTeacher />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (view === ViewState.LOGIN) return renderAuth();

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-200 selection:text-brand-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-20 shadow-2xl shadow-slate-200/50">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 text-brand-600 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
                            L
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-slate-800">Sphere<span className="text-brand-500">.ai</span></span>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden text-2xl flex items-center justify-center border-2 border-white shadow-sm">
                            {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user.avatar
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-slate-800 truncate">{user.name}</h3>
                            <p className="text-xs text-slate-500 truncate">{user.level}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={ChartBarIcon}
                        label="Dashboard"
                        active={view === ViewState.DASHBOARD}
                        onClick={() => setView(ViewState.DASHBOARD)}
                    />
                    <SidebarItem
                        icon={AcademicCapIcon}
                        label="Courses"
                        active={view === ViewState.COURSES || view === ViewState.COURSE_GENERATOR || view === ViewState.LESSON_VIEW || view === ViewState.QUIZ}
                        onClick={() => setView(ViewState.COURSES)}
                    />
                    <SidebarItem
                        icon={BuildingLibraryIcon}
                        label="Library"
                        active={view === ViewState.MY_LIBRARY}
                        onClick={() => setView(ViewState.MY_LIBRARY)}
                    />
                    <SidebarItem
                        icon={UsersIcon}
                        label="Study Groups"
                        active={view === ViewState.STUDY_GROUPS}
                        onClick={() => setView(ViewState.STUDY_GROUPS)}
                    />
                    <SidebarItem
                        icon={BeakerIcon}
                        label="AI Lab"
                        active={view === ViewState.AI_LAB}
                        onClick={() => setView(ViewState.AI_LAB)}
                    />
                    <SidebarItem
                        icon={UserGroupIcon}
                        label="My Profile"
                        active={view === ViewState.MY_DETAILS}
                        onClick={() => setView(ViewState.MY_DETAILS)}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => setView(ViewState.LOGIN)}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5 rotate-90" />
                        <span className="font-bold text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto h-full bg-slate-50 relative">
                {view === ViewState.DASHBOARD && renderDashboard()}
                {view === ViewState.COURSES && renderCourses()}
                {view === ViewState.COURSE_GENERATOR && renderCourseGenerator()}
                {view === ViewState.LESSON_VIEW && renderLessonView()}
                {view === ViewState.QUIZ && renderQuiz()}
                {view === ViewState.MY_LIBRARY && renderLibrary()}
                {view === ViewState.STUDY_GROUPS && renderStudyGroups()}
                {view === ViewState.MY_DETAILS && renderMyDetails()}
                {view === ViewState.AI_LAB && renderAILab()}
            </main>
        </div>
    );
};

export default App;