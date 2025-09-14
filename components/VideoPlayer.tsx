'use client';

import ReactPlayer from 'react-player';
import { useState } from 'react';

type VideoPlayerProps = {
    url: string;
    className?: string;
};

export default function VideoPlayer({ url, className }: VideoPlayerProps) {
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`aspect-video ${className}`}>
            {hasError ? (
                <div className="w-full h-full bg-red-50 flex items-center justify-center rounded-lg">
                    <p className="text-red-600">Failed to load video</p>
                </div>
            ) : (
                <ReactPlayer
                    url={url}
                    width="100%"
                    height="100%"
                    controls
                    onError={() => setHasError(true)}
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                            },
                        },
                    }}
                />
            )}
        </div>
    );
}