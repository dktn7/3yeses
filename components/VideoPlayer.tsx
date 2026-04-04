"use client";

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import Image from 'next/image';
import Link from 'next/link';
import SwoopingTick from './SwoopingTick';
import { User, Play, Pause, Volume2, VolumeX, Maximize, ExternalLink, Loader2, Settings, RectangleHorizontal, Captions, Check, ChevronRight, ChevronLeft, Music, Image as ImageIcon } from 'lucide-react';

type VideoPlayerProps = {
    url: string;
    className?: string;
    talentProfile?: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    showLogo?: boolean;
    relatedMedia?: Array<{
        id: string;
        title: string;
        thumbnail?: string;
        mediaUrl: string;
        type: 'IMAGE' | 'VIDEO' | 'AUDIO';
    }>;
    onMediaSelect?: (media: any) => void;
    onToggleTheater?: () => void;
    isTheaterMode?: boolean;
    type?: 'IMAGE' | 'VIDEO' | 'AUDIO';
    thumbnail?: string;
};

export default function VideoPlayer({ url, className, talentProfile, showLogo = true, relatedMedia = [], onMediaSelect, onToggleTheater, isTheaterMode = false, type = 'VIDEO', thumbnail }: VideoPlayerProps) {
    const [hasError, setHasError] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [ended, setEnded] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [activeSetting, setActiveSetting] = useState<'main' | 'speed' | 'quality' | 'captions' | 'captionOptions'>('main');
    const [quality, setQuality] = useState('Auto');
    const [captions, setCaptions] = useState(false);
    const [captionsLang, setCaptionsLang] = useState('Off');
    const [captionSize, setCaptionSize] = useState('Normal');
    const [captionColor, setCaptionColor] = useState('White');
    const [captionBackground, setCaptionBackground] = useState('Black (Transparent)');
    const [audioBarHeights, setAudioBarHeights] = useState<number[]>([]);
    
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);

    const isYoutube = !!url && (url.includes('youtube.com') || url.includes('youtu.be'));
    const isImage = type === 'IMAGE';
    const isAudio = type === 'AUDIO';
    
    // Audio visualization animation
    useEffect(() => {
        if (isAudio && playing) {
            const interval = setInterval(() => {
                const heights = [...Array(60)].map((_, i) => {
                    const centerDistance = Math.abs(i - 30) / 30;
                    const baseHeight = (1 - centerDistance) * 100;
                    return Math.max(4, baseHeight * (0.3 + Math.random() * 0.7));
                });
                setAudioBarHeights(heights);
            }, 100);
            return () => clearInterval(interval);
        } else {
            setAudioBarHeights([...Array(60)].map(() => 4));
        }
    }, [isAudio, playing]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
                setActiveSetting('main');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Control captions on the actual video element
    useEffect(() => {
        const video = playerRef.current?.getInternalPlayer?.();
        if (video && video.textTracks) {
            const tracks = video.textTracks;
            for (let i = 0; i < tracks.length; i++) {
                tracks[i].mode = captions && captionsLang !== 'Off' ? 'showing' : 'hidden';
            }
        }
        
        // For YouTube videos, control captions via API
        if (isYoutube && playerRef.current?.getInternalPlayer?.()) {
            const ytPlayer = playerRef.current.getInternalPlayer();
            if (ytPlayer && ytPlayer.setOption) {
                if (captions && captionsLang !== 'Off') {
                    ytPlayer.setOption('captions', 'track', {'languageCode': captionsLang.toLowerCase()});
                    ytPlayer.setOption('captions', 'fontSize', captionSize === 'Small' ? 0 : captionSize === 'Large' ? 2 : 1);
                } else {
                    ytPlayer.setOption('captions', 'track', {});
                }
            }
        }
    }, [captions, captionsLang, captionSize, isYoutube]);

    // Control YouTube video quality
    useEffect(() => {
        if (isYoutube && playerRef.current?.getInternalPlayer?.() && quality !== 'Auto') {
            const ytPlayer = playerRef.current.getInternalPlayer();
            if (ytPlayer && ytPlayer.setPlaybackQuality) {
                const qualityMap: Record<string, string> = {
                    '1080p': 'hd1080',
                    '720p': 'hd720',
                    '480p': 'large',
                    '360p': 'medium',
                    '240p': 'small'
                };
                ytPlayer.setPlaybackQuality(qualityMap[quality] || 'default');
            }
        }
    }, [quality, isYoutube]);

    const getCaptionStyles = () => {
        const sizeMap: Record<string, string> = {
            'Small': 'text-sm',
            'Normal': 'text-base',
            'Large': 'text-xl'
        };
        
        const colorMap: Record<string, string> = {
            'White': 'text-white',
            'Yellow': 'text-yellow-400',
            'Green': 'text-green-400',
            'Cyan': 'text-cyan-400'
        };

        const bgMap: Record<string, string> = {
            'None': '',
            'Black': 'bg-black',
            'Black (Transparent)': 'bg-black/60'
        };

        return `${sizeMap[captionSize]} ${colorMap[captionColor]} ${bgMap[captionBackground]} px-2 py-1 rounded`;
    };

    const handlePlayPause = () => {
        if (ended) {
            setEnded(false);
            playerRef.current?.seekTo(0);
        }
        setPlaying(!playing);
    };

    const handleEnded = () => {
        setPlaying(false);
        setEnded(true);
        setShowControls(true);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
        setMuted(parseFloat(e.target.value) === 0);
    };

    const handleToggleMute = () => {
        const newMuted = !muted;
        setMuted(newMuted);
        if (isAudio && playerRef.current) {
            playerRef.current.muted = newMuted;
        }
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPlayed = parseFloat(e.target.value);
        setPlayed(newPlayed);
        
        // Immediate seek for both audio and video during drag
        if (playerRef.current) {
            if (isAudio && playerRef.current.currentTime !== undefined) {
                playerRef.current.currentTime = newPlayed * duration;
            } else if (!isAudio && playerRef.current.seekTo) {
                playerRef.current.seekTo(newPlayed, 'fraction');
            }
        }
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
    };

    const handleProgress = (state: { played: number }) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleDuration = (duration: number) => {
        setDuration(duration);
    };

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                containerRef.current.requestFullscreen();
            }
        }
    };

    function formatTime(seconds: number) {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    }

    return (
        <>
            <style jsx global>{`
                video::cue {
                    ${captionSize === 'Small' ? 'font-size: 0.875rem;' : captionSize === 'Large' ? 'font-size: 1.5rem;' : 'font-size: 1.125rem;'}
                    ${captionColor === 'White' ? 'color: white;' : captionColor === 'Yellow' ? 'color: #facc15;' : captionColor === 'Green' ? 'color: #4ade80;' : 'color: #22d3ee;'}
                    ${captionBackground === 'None' ? 'background: transparent;' : captionBackground === 'Black' ? 'background: black;' : 'background: rgba(0, 0, 0, 0.6);'}
                    padding: 0.25rem 0.5rem;
                }
            `}</style>
            {type === 'IMAGE' ? (
                // Simple image view without player controls
                <div 
                    className={`relative ${isTheaterMode ? 'h-full w-full' : 'aspect-video'} ${className}`}
                >
                    {hasError ? (
                        <div className="w-full h-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center rounded-lg">
                            <p className="text-red-600 dark:text-red-400">Failed to load image</p>
                        </div>
                    ) : url ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={url}
                                alt="Content"
                                fill
                                className="object-contain"
                                onError={() => setHasError(true)}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-400 text-sm">No media available</p>
                        </div>
                    )}
                </div>
            ) : (
                // Full player for VIDEO and AUDIO
                <div 
                    ref={containerRef}
                    className={`relative group bg-black overflow-hidden ${isTheaterMode ? 'h-full w-full' : 'w-full h-full'} ${className}`}
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => playing && setShowControls(false)}
                >
                    {hasError ? (
                        <div className="w-full h-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center rounded-lg">
                            <p className="text-red-600 dark:text-red-400">Failed to load {type === 'AUDIO' ? 'audio' : 'video'}</p>
                        </div>
                    ) : (
                        <>
                            {!isReady && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
                                </div>
                            )}
                    
                            {/* Media Container */}
                            <div className={`absolute inset-0 overflow-hidden ${isYoutube && playing ? 'pointer-events-none' : ''}`}>
                                <div className={`w-full h-full transition-transform duration-300 flex items-center justify-center`}>
                                    {type === 'AUDIO' ? (
                                        // Native HTML audio player for better compatibility
                                        <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 sm:p-6 gap-4 sm:gap-6">
                                            {/* PSP-style Header */}
                                            <div className="flex items-center justify-between flex-shrink-0">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white text-lg sm:text-xl font-medium truncate mb-1">
                                                        {talentProfile?.name || 'Unknown Artist'}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-sm truncate">3YESES Media Hub</span>
                                                        <span className="flex-shrink-0 px-2 py-0.5 text-xs font-mono bg-gray-700/50 text-gray-400 rounded">
                                                            AUDIO
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary-blue dark:text-accent-red font-bold text-lg">3YESES</span>
                                                    <SwoopingTick size={24} />
                                                </div>
                                            </div>
                                            
                                            {/* Waveform Visualization */}
                                            <div className="flex-1 flex items-end justify-center gap-1 px-4 min-h-[200px]">
                                                {audioBarHeights.map((height, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 bg-gradient-to-t from-primary-blue to-blue-400 dark:from-accent-red dark:to-red-400 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                                                        style={{
                                                            height: `${Math.max(8, height)}px`,
                                                            minHeight: '8px'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            
                                            {/* Native Audio Element */}
                                            <audio
                                                ref={playerRef}
                                                src={url}
                                                onPlay={() => {
                                                    setPlaying(true);
                                                    setEnded(false);
                                                    setIsReady(true);
                                                }}
                                                onPause={() => setPlaying(false)}
                                                onEnded={handleEnded}
                                                onError={() => setHasError(true)}
                                                onCanPlay={() => setIsReady(true)}
                                                onLoadedMetadata={() => {
                                                    if (playerRef.current) {
                                                        setDuration(playerRef.current.duration);
                                                        setIsReady(true);
                                                    }
                                                }}
                                                onTimeUpdate={() => {
                                                    if (playerRef.current) {
                                                        setPlayed(playerRef.current.currentTime / playerRef.current.duration);
                                                    }
                                                }}
                                                crossOrigin="anonymous"
                                                className="hidden"
                                            />
                                            
                                            {/* Controls */}
                                            <div className="space-y-3 flex-shrink-0">
                                                {/* Progress Bar */}
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={0.999999}
                                                    step="any"
                                                    value={played}
                                                    onMouseDown={handleSeekMouseDown}
                                                    onChange={handleSeekChange}
                                                    onMouseUp={handleSeekMouseUp}
                                                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary-blue dark:[&::-webkit-slider-thumb]:bg-accent-red [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:w-4 hover:[&::-webkit-slider-thumb]:h-4"
                                                    style={{
                                                        backgroundImage: `linear-gradient(to right, rgb(59, 130, 246) ${played * 100}%, rgb(55, 65, 81) ${played * 100}%)`
                                                    }}
                                                />
                                                
                                                {/* Time Display */}
                                                <div className="flex items-center justify-between text-sm text-gray-400">
                                                    <span>{formatTime(played * duration)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                                
                                                {/* Playback Controls */}
                                                <div className="flex items-center justify-center gap-6">
                                                    <button 
                                                        className="text-white hover:text-primary-blue dark:hover:text-accent-red transition-colors"
                                                        onClick={handleToggleMute}
                                                    >
                                                        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                                    </button>
                                                    <button 
                                                        className="w-12 h-12 bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all hover:scale-110"
                                                        onClick={() => {
                                                            if (playerRef.current) {
                                                                if (playing) {
                                                                    playerRef.current.pause();
                                                                } else {
                                                                    playerRef.current.play();
                                                                }
                                                            }
                                                            setPlaying(!playing);
                                                        }}
                                                    >
                                                        {playing ? <Pause size={24} /> : <Play size={24} />}
                                                    </button>
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max="1" 
                                                        step="0.05" 
                                                        value={muted ? 0 : volume}
                                                        onChange={(e) => {
                                                            const newVolume = parseFloat(e.target.value);
                                                            setVolume(newVolume);
                                                            setMuted(newVolume === 0);
                                                            if (playerRef.current) {
                                                                playerRef.current.volume = newVolume;
                                                            }
                                                        }}
                                                        className="w-24 accent-primary-blue dark:accent-accent-red"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full relative">
                                            {React.createElement(ReactPlayer as any, {
                                        ref: playerRef,
                                        url,
                                        width: '100%',
                                        height: '100%',
                                        playing,
                                        volume,
                                        muted,
                                        playbackRate,
                                        controls: false,
                                        progressInterval: 100,
                                        onReady: () => setIsReady(true),
                                        onProgress: handleProgress,
                                        onDuration: handleDuration,
                                        onError: () => setHasError(true),
                                        onSeek: (seconds: number) => {
                                            console.log('Seeked to:', seconds);
                                        },
                                        onPlay: () => {
                                            setPlaying(true);
                                            setEnded(false);
                                        },
                                        onPause: () => setPlaying(false),
                                        onEnded: handleEnded,
                                        style: { 
                                            pointerEvents: isYoutube ? 'none' : 'auto',
                                            objectFit: 'contain'
                                        },
                                        config: {
                                            file: {
                                                attributes: {
                                                    controlsList: 'nodownload',
                                                    crossOrigin: 'anonymous',
                                                    style: {
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }
                                                },
                                            },
                                            youtube: {
                                                playerVars: { 
                                                    showinfo: 0, 
                                                    modestbranding: 1, 
                                                    rel: 0, 
                                                    controls: 0,
                                                    iv_load_policy: 3,
                                                    disablekb: 1,
                                                    fs: 0,
                                                    playsinline: 1,
                                                    cc_load_policy: captions ? 1 : 0,
                                                    origin: typeof window !== 'undefined' ? window.location.origin : undefined
                                                }
                                            }
                                        },
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                    
                            {/* Click to Play/Pause Overlay - High Z-index to block YouTube hover interactions and blur on pause */}
                            {/* Hidden for AUDIO since audio has its own controls */}
                            {type !== 'AUDIO' && (
                            <div 
                            className={`absolute inset-0 z-10 cursor-pointer transition-all duration-300 ${(!playing && isReady) || ended ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'} ${isYoutube ? 'pointer-events-auto' : ''}`}
                            onClick={handlePlayPause}
                        />
                            )}

                            {/* More Videos Overlay (Paused or Ended) - Hidden for AUDIO */}
                            {type !== 'AUDIO' && ((!playing && isReady) || ended) && relatedMedia.length > 0 && (
                        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-start justify-end p-8 pb-24 pointer-events-none">
                            <div className="w-full max-w-4xl pointer-events-auto">
                                <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                                    More from 3YESES
                                    <SwoopingTick size={24} />
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {relatedMedia.slice(0, 4).map((media) => (
                                        <button
                                            key={media.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMediaSelect?.(media);
                                            }}
                                            className="group/card relative aspect-video rounded-lg overflow-hidden bg-gray-800 ring-1 ring-white/10 hover:ring-primary-blue transition-all hover:scale-105"
                                        >
                                            {media.thumbnail || (media.type === 'IMAGE' && media.mediaUrl) ? (
                                                <Image 
                                                    src={media.thumbnail || media.mediaUrl} 
                                                    alt={media.title} 
                                                    fill 
                                                    className="object-cover opacity-80 group-hover/card:opacity-100 transition-opacity" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                    {media.type === 'AUDIO' ? (
                                                        <Music className="w-8 h-8 text-white/50" />
                                                    ) : media.type === 'IMAGE' ? (
                                                        <ImageIcon className="w-8 h-8 text-white/50" />
                                                    ) : (
                                                        <Play className="w-8 h-8 text-white/50" />
                                                    )}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                                                <p className="text-white text-xs font-medium line-clamp-2 text-left">{media.title}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Captions Overlay */}
                    {captions && (
                        <div className={`absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none z-30 px-8 text-center transition-all duration-300 ${showControls ? 'bottom-24' : 'bottom-8'}`}>
                             <span className={getCaptionStyles()}>
                                 This is a sample caption text to demonstrate the style settings.
                             </span>
                        </div>
                    )}

                    {/* Custom Controls Overlay - Only for VIDEO (Audio has its own controls) */}
                    {type !== 'AUDIO' && (
                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${showControls || !playing || ended ? 'opacity-100' : 'opacity-0'} z-40`}>
                        
                        {/* Top Gradient for visibility */}
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                        {/* Top Left - Logo */}
                        {showLogo && (
                            <div className="absolute top-4 left-4 z-20 pointer-events-auto">
                                <Link href="/" className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/10 hover:bg-black/60 transition-colors">
                                    <span className="text-white font-bold text-sm tracking-wider">3YESES</span>
                                    <SwoopingTick size={20} />
                                </Link>
                            </div>
                        )}

                        {/* Top Right - Profile */}
                        {talentProfile && (
                            <Link 
                                href={`/talent/${(talentProfile as any).userId ?? talentProfile.id}`}
                                className="absolute top-4 right-4 z-20 pointer-events-auto hover:scale-105 transition-all duration-300"
                                target="_blank"
                            >
                                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm pl-4 pr-1.5 py-1.5 rounded-full hover:bg-black/60 transition-colors shadow-lg border border-white/10 group/profile">
                                    <span className="text-white font-medium text-sm truncate max-w-[150px] hidden sm:block">
                                        {talentProfile.name}
                                    </span>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border-2 border-white/20 relative group-hover/profile:border-primary-blue transition-colors">
                                        {talentProfile.avatarUrl ? (
                                            <Image 
                                                src={talentProfile.avatarUrl} 
                                                alt={talentProfile.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Center Play Button (only when paused) */}
                        {!playing && isReady && !ended && !isImage && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button 
                                    onClick={handlePlayPause}
                                    className="w-16 h-16 bg-primary-blue/90 hover:bg-primary-blue text-white rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xl pointer-events-auto backdrop-blur-sm"
                                >
                                    <Play className="w-8 h-8 ml-1" fill="currentColor" />
                                </button>
                            </div>
                        )}

                        {/* Bottom Controls Bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-2 pt-12 pointer-events-auto">
                            {/* Progress Bar */}
                            <div className="w-full mb-2 flex items-center gap-2 group/progress">
                                <input
                                    type="range"
                                    min={0}
                                    max={0.999999}
                                    step="any"
                                    value={played}
                                    onMouseDown={handleSeekMouseDown}
                                    onChange={handleSeekChange}
                                    onMouseUp={handleSeekMouseUp}
                                    className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary-blue [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all group-hover/progress:[&::-webkit-slider-thumb]:w-4 group-hover/progress:[&::-webkit-slider-thumb]:h-4"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, #3B82F6 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%)`
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={handlePlayPause}
                                        className="text-white hover:text-primary-blue transition-colors"
                                    >
                                        {playing ? (
                                            <Pause className="w-6 h-6" fill="currentColor" />
                                        ) : (
                                            <Play className="w-6 h-6" fill="currentColor" />
                                        )}
                                    </button>

                                    <div className="flex items-center gap-2 group/volume">
                                        <button 
                                            onClick={handleToggleMute}
                                            className="text-white hover:text-primary-blue transition-colors"
                                        >
                                            {muted || volume === 0 ? (
                                                <VolumeX className="w-6 h-6" />
                                            ) : (
                                                <Volume2 className="w-6 h-6" />
                                            )}
                                        </button>
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step="any"
                                            value={muted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                            style={{
                                                backgroundImage: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`
                                            }}
                                        />
                                    </div>

                                    <div className="text-white text-sm font-medium">
                                        {formatTime(duration * played)} / {formatTime(duration)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Captions */}
                                    <button 
                                        onClick={() => {
                                            const newStatus = !captions;
                                            setCaptions(newStatus);
                                            if (newStatus && captionsLang === 'Off') {
                                                setCaptionsLang('English');
                                            } else if (!newStatus) {
                                                setCaptionsLang('Off');
                                            }
                                        }}
                                        className={`transition-colors ${captions ? 'text-primary-blue' : 'text-white hover:text-primary-blue'}`}
                                        title="Captions"
                                    >
                                        <Captions className="w-6 h-6" />
                                        {captions && <div className="h-0.5 w-full bg-primary-blue mt-0.5 rounded-full" />}
                                    </button>

                                    {/* Settings */}
                                    <div className="relative" ref={settingsRef}>
                                        {showSettings && (
                                            <div className="absolute bottom-full right-0 mb-4 w-64 bg-black/90 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl border border-white/10 text-sm animate-in fade-in slide-in-from-bottom-2">
                                                {activeSetting === 'main' && (
                                                    <div className="py-2">
                                                        <button 
                                                            onClick={() => setActiveSetting('speed')}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors text-white"
                                                        >
                                                            <span>Playback Speed</span>
                                                            <span className="text-gray-400 flex items-center gap-1">
                                                                {playbackRate === 1 ? 'Normal' : `${playbackRate}x`}
                                                                <ChevronRight className="w-4 h-4" />
                                                            </span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveSetting('captions')}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors text-white"
                                                        >
                                                            <span>Subtitles/CC</span>
                                                            <span className="text-gray-400 flex items-center gap-1">
                                                                {captionsLang}
                                                                <ChevronRight className="w-4 h-4" />
                                                            </span>
                                                        </button>
                                                        <button 
                                                            onClick={() => setActiveSetting('quality')}
                                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors text-white"
                                                        >
                                                            <span>Quality</span>
                                                            <span className="text-gray-400 flex items-center gap-1">
                                                                {quality}
                                                                <ChevronRight className="w-4 h-4" />
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {activeSetting === 'speed' && (
                                                    <div className="py-2">
                                                        <button 
                                                            onClick={() => setActiveSetting('main')}
                                                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-white border-b border-white/10 mb-1"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                            <span className="font-medium">Playback Speed</span>
                                                        </button>
                                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                                            <button
                                                                key={rate}
                                                                onClick={() => {
                                                                    setPlaybackRate(rate);
                                                                    setShowSettings(false);
                                                                    setActiveSetting('main');
                                                                }}
                                                                className="w-full px-8 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                {playbackRate === rate && <Check className="w-4 h-4 text-primary-blue absolute left-2" />}
                                                                <span>{rate === 1 ? 'Normal' : rate}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeSetting === 'captions' && (
                                                    <div className="py-2">
                                                        <button 
                                                            onClick={() => setActiveSetting('main')}
                                                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-white border-b border-white/10 mb-1"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                            <span className="font-medium">Subtitles/CC</span>
                                                        </button>
                                                        {['Off', 'English', 'Spanish', 'French', 'Auto-generated'].map((lang) => (
                                                            <button
                                                                key={lang}
                                                                onClick={() => {
                                                                    setCaptionsLang(lang);
                                                                    setCaptions(lang !== 'Off');
                                                                    setShowSettings(false);
                                                                    setActiveSetting('main');
                                                                }}
                                                                className="w-full px-8 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                {captionsLang === lang && <Check className="w-4 h-4 text-primary-blue absolute left-2" />}
                                                                <span>{lang}</span>
                                                            </button>
                                                        ))}
                                                        <div className="border-t border-white/10 mt-1 pt-1">
                                                            <button 
                                                                onClick={() => setActiveSetting('captionOptions')}
                                                                className="w-full px-8 py-2 flex items-center justify-between hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                <span>Options</span>
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeSetting === 'captionOptions' && (
                                                    <div className="py-2 max-h-64 overflow-y-auto scrollbar-hide">
                                                        <button 
                                                            onClick={() => setActiveSetting('captions')}
                                                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-white border-b border-white/10 mb-1 sticky top-0 bg-black/90 backdrop-blur-md z-10"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                            <span className="font-medium">Options</span>
                                                        </button>
                                                        
                                                        <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold tracking-wider">Font Size</div>
                                                        {['Small', 'Normal', 'Large'].map((size) => (
                                                            <button
                                                                key={size}
                                                                onClick={() => setCaptionSize(size)}
                                                                className="w-full px-8 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                {captionSize === size && <Check className="w-4 h-4 text-primary-blue absolute left-2" />}
                                                                <span>{size}</span>
                                                            </button>
                                                        ))}

                                                        <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold tracking-wider mt-2">Font Color</div>
                                                        {['White', 'Yellow', 'Green', 'Cyan'].map((color) => (
                                                            <button
                                                                key={color}
                                                                onClick={() => setCaptionColor(color)}
                                                                className="w-full px-8 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                {captionColor === color && <Check className="w-4 h-4 text-primary-blue absolute left-2" />}
                                                                <span>{color}</span>
                                                            </button>
                                                        ))}

                                                        <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold tracking-wider mt-2">Background</div>
                                                        {['None', 'Black', 'Black (Transparent)'].map((bg) => (
                                                            <button
                                                                key={bg}
                                                                onClick={() => setCaptionBackground(bg)}
                                                                className="w-full px-8 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                {captionBackground === bg && <Check className="w-4 h-4 text-primary-blue absolute left-2" />}
                                                                <span>{bg}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeSetting === 'quality' && (
                                                    <div className="py-2">
                                                        <button 
                                                            onClick={() => setActiveSetting('main')}
                                                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-white border-b border-white/10 mb-1"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                            <span className="font-medium">Quality</span>
                                                        </button>
                                                        {['Auto', '1080p', '720p', '480p'].map((q) => (
                                                            <button
                                                                key={q}
                                                                onClick={() => {
                                                                    setQuality(q);
                                                                    setShowSettings(false);
                                                                    setActiveSetting('main');
                                                                }}
                                                                className="w-full px-8 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-white"
                                                            >
                                                                {quality === q && <Check className="w-4 h-4 text-primary-blue absolute left-2" />}
                                                                <span>{q}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setShowSettings(!showSettings)}
                                            className={`transition-colors ${showSettings ? 'text-primary-blue rotate-45' : 'text-white hover:text-primary-blue'} transform duration-300`}
                                        >
                                            <Settings className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {/* Theater Mode */}
                                    {onToggleTheater && (
                                        <button 
                                            onClick={onToggleTheater}
                                            className="text-white hover:text-primary-blue transition-colors"
                                            title={isTheaterMode ? "Default View" : "Theater Mode"}
                                        >
                                            <RectangleHorizontal className={`w-6 h-6 ${isTheaterMode ? 'text-primary-blue' : ''}`} />
                                        </button>
                                    )}

                                    {/* Source Link */}
                                    <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-white hover:text-primary-blue flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1 bg-white/10 rounded hover:bg-white/20"
                                        title="Watch on Source"
                                    >
                                        <span>Source</span>
                                        <ExternalLink className="w-5 h-5" />
                                    </a>

                                    <button 
                                        onClick={handleFullscreen}
                                        className="text-white hover:text-primary-blue transition-colors"
                                    >
                                        <Maximize className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}