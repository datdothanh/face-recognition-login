/* eslint-disable no-unused-vars */
import "../css/Feature.css";

import React, { useRef, useEffect, useState } from "react";

import axios from "axios";
import * as faceapi from "face-api.js";

export const Feature = () => {
  const [faceData, setFaceData] = useState([]);
  const videoHeight = 700;
  const videoWidth = 375;
  const [start, setStart] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  //const MODEL_URL = process.env.PUBLIC_URL + "/models";
  //IOS support
  // useEffect(() => {
  //   const { current: videoElement } = videoRef;
  //   videoElement.setAttribute("muted", "");
  //   videoElement.setAttribute("playsinline", "");
  // }, []);
  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(
          "facenet/models/tiny_face_detector"
        ),
        faceapi.nets.faceRecognitionNet.loadFromUri(
          "facenet/models/face_recognition"
        ),
        faceapi.nets.faceLandmark68Net.loadFromUri(
          "facenet/models/face_landmark_68"
        ),
        faceapi.nets.faceExpressionNet.loadFromUri(
          "facenet/models/face_expression"
        ),
        faceapi.nets.ageGenderNet.loadFromUri(
          "facenet/models/age_gender_model"
        ),
      ]).then(startVideo);
    };
    loadModels();
  }, []);
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { exact: "user" },
        },
      });
      videoRef.current.srcObject = stream;
    } catch (error) {}
  };

  const handleUpload = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "d782000");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddlt0l9we/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {}
  };

  const handlePlay = () => {
    setInterval(async () => {
      if (start) {
        setStart(false);
      }
      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
        videoRef.current
      );
      const displaySize = {
        width: videoWidth,
        height: videoHeight,
      };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      // Extract age and gender information
      const faceDetails = detections.map((detection) => {
        const age = Math.round(detection.age);
        const gender = detection.gender;
        return { age, gender };
      });

      // Update the faceData state
      setFaceData(faceDetails);

      const resized = faceapi.resizeResults(detections, displaySize);
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, videoWidth, videoHeight);
      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);

      detections.forEach((detection) => {
        const { age, gender, box } = detection;
        new faceapi.draw.DrawTextField(
          [`${Math.round(age)} years`, `${gender}`],
          box.bottomLeft
        ).draw(canvasRef.current);
      });

      //console.log(detections);
      // if (detections.length !== 0) {
      //   const context = canvasRef.current.getContext("2d");
      //   context.drawImage(
      //     videoRef.current,
      //     0,
      //     0,
      //     canvasRef.current.width,
      //     canvasRef.current.height
      //   );

      //   // Convert the canvas image to a data URL
      //   const imageDataUrl = canvasRef.current.toDataURL("image/png");
      //   handleUpload(imageDataUrl);

      //   // Create a link element and set the captured image as the href
      //   // const link = document.createElement('a');
      //   // link.href = imageDataUrl;
      //   // link.download = 'captured_frame.png';
      //   // link.click();
      // }
    }, 100);
  };
  return (
    <div className="container face-wrapper">
      <h1>{start ? "install" : "ready"}</h1>
      <div className="display-video">
        <video
          class="player"
          ref={videoRef}
          autoPlay
          height={videoHeight}
          width={videoWidth}
          onPlay={handlePlay}
          muted
          playsinline
        />
        <canvas ref={canvasRef} className="canvas" />
      </div>
      <div>
        {faceData.map((data, index) => (
          <div className="infor" key={index}>
            <p>Face {index + 1}</p>
            <p>Age: {data.age}</p>
            <p>Gender: {data.gender}</p>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};
