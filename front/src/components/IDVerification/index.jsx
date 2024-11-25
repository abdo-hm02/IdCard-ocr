import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import UploadBox from './UploadStep';
import WebcamStep from './WebcamStep';
import ResultsStep from './ResultsStep';

const IDVerification = () => {
  const [step, setStep] = useState(1);
  const [frontID, setFrontID] = useState(null);
  const [backID, setBackID] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileUpload = (event, side) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setFrontID(reader.result);
          setStep(2);
        } else {
          setBackID(reader.result);
          setStep(3);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      setError('Unable to access webcam. Please make sure you have granted permission.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const image = canvas.toDataURL('image/jpeg');
    setSelfieImage(image);
    stopWebcam();
    setStep(4);
  };

  const convertBase64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const processVerification = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // First, convert base64 images to Files
      const frontIDFile = convertBase64ToFile(frontID, 'front-id.jpg');
      const selfieFile = convertBase64ToFile(selfieImage, 'selfie.jpg');
      
      // Create FormData for face comparison
      const faceComparisonData = new FormData();
      faceComparisonData.append('image1', frontIDFile);
      faceComparisonData.append('image2', selfieFile);

      // Face comparison API call
      const faceResponse = await fetch('http://localhost:5000/api/compare-faces', {
        method: 'POST',
        body: faceComparisonData
      });
      
      const faceResult = await faceResponse.json();
      
      if (!faceResult.success || !faceResult.match) {
        throw new Error('Face verification failed. Please try again.');
      }

      // Create FormData for text extraction
      const textExtractionData = new FormData();
      textExtractionData.append('image', frontIDFile);

      // Text extraction API call
      const textResponse = await fetch('http://localhost:5000/api/extract-text', {
        method: 'POST',
        body: textExtractionData
      });

      const textResult = await textResponse.json();

      if (!textResult.success) {
        throw new Error('Failed to extract information from ID.');
      }

      // Process extracted text into structured data
      const extractedData = processExtractedText(textResult.extracted_text);
      
      setExtractedData(extractedData);
      setStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Identity Verification</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <ProgressBar currentStep={step} />
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <UploadBox
                  onFileSelect={(e) => handleFileUpload(e, 'front')}
                  title="Upload ID Front"
                  subtitle="Please upload a clear image of your ID's front side"
                  image={frontID}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <UploadBox
                  onFileSelect={(e) => handleFileUpload(e, 'back')}
                  title="Upload ID Back"
                  subtitle="Please upload a clear image of your ID's back side"
                  image={backID}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <WebcamStep
                  videoRef={videoRef}
                  onCapture={captureImage}
                  onRetake={startWebcam}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <img src={frontID} alt="ID Front" className="border rounded-lg" />
                    <img src={backID} alt="ID Back" className="border rounded-lg" />
                    <img src={selfieImage} alt="Selfie" className="border rounded-lg" />
                  </div>
                  <button
                    onClick={processVerification}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center mx-auto hover:bg-blue-700 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Identity'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && extractedData && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <ResultsStep data={extractedData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default IDVerification;