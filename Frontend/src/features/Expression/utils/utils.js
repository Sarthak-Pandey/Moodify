import {
    FaceLandmarker,
    FilesetResolver,
} from "@mediapipe/tasks-vision";

export const init = async ({
    landmarkerRef,
    videoRef,
    streamRef,
}) => {
    // Load MediaPipe
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    // Load Model
    landmarkerRef.current =
        await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            },
            runningMode: "VIDEO",
            outputFaceBlendshapes: true,
            numFaces: 1,
        });

    // Start Webcam
    streamRef.current =
        await navigator.mediaDevices.getUserMedia({
            video: true,
        });

    videoRef.current.srcObject = streamRef.current;
    await videoRef.current.play();
};

export const detect = ({
    landmarkerRef,
    videoRef,
    setExpression,
}) => {
    if (
        !videoRef.current ||
        !landmarkerRef.current
    ) {
        return;
    }

    const result =
        landmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now()
        );

    if (result.faceBlendshapes.length > 0) {
        const blendshapes =
            result.faceBlendshapes[0].categories;

        const getScore = (name) =>
            blendshapes.find(
                (item) => item.categoryName === name
            )?.score || 0;

        const smileLeft = getScore("mouthSmileLeft");
        const smileRight = getScore("mouthSmileRight");
        const jawOpen = getScore("jawOpen");
        const browUp = getScore("browInnerUp");
        const frownLeft = getScore("mouthFrownLeft");
        const frownRight = getScore("mouthFrownRight");

        let currentExpression = "😐 Neutral";

        if (
            smileLeft > 0.05 &&
            smileRight > 0.05
        ) {
            currentExpression = "😊 Happy";
        } else if (
            jawOpen > 0.05 &&
            browUp > 0.05
        ) {
            currentExpression = "😲 Surprised";
        } else if (
            frownLeft > 0.01 &&
            frownRight > 0.01
        ) {
            currentExpression = "😢 Sad";
        }

        setExpression(currentExpression);
    }
        requestAnimationFrame(() =>
            detect({
                landmarkerRef,
                videoRef,
                setExpression,
            })
        );
};

