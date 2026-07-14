import { useEffect, useRef, useState } from "react";
import { init, detect } from "../utils/utils";

export default function FaceExpression() {
    const videoRef = useRef(null);
    const landmarkerRef = useRef(null);
    const streamRef = useRef(null);
    const [expression, setExpression] =
    useState("Detecting...");

    const [isDetecting, setIsDetecting] = useState(false);

    useEffect(() => {
        const start = async () => {
            await init({
                landmarkerRef,
                videoRef,
                streamRef,
            });
        };

        start();

        return () => {

            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }

            if (streamRef.current) {
                streamRef.current
                    .getTracks()
                    .forEach((track) =>
                        track.stop()
                    );
            }
        };
    }, []);

    const handleDetect = () => {
        if (isDetecting) return;
        setIsDetecting(true);
        detect({
            landmarkerRef,
            videoRef,
            setExpression,
        });
    };

    return (
        <div
            style={{
                textAlign: "center",
                marginTop: "30px",
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                    width: "500px",
                    borderRadius: "15px",
                }}
            />

            <h2>{expression}</h2>

            <button onClick={handleDetect} disabled={isDetecting}>
                {isDetecting ? "Detecting Expression..." : "Detect Expression"}
            </button>
        </div>
    );
}

