// Speech synthesis for voice feedback during exercises
const speechService = {
  // Initialize speech synthesis
  init(): boolean {
    return 'speechSynthesis' in window;
  },

  // Speak text with optional voice options
  speak(text: string, options: {
    rate?: number; // 0.1 to 10
    pitch?: number; // 0 to 2
    volume?: number; // 0 to 1
    voice?: SpeechSynthesisVoice;
  } = {}): void {
    if (!this.init()) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Set voice if provided
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en-') && voice.name.includes('Google') // Prefer Google voices
      ) || voices.find(voice => voice.lang.includes('en-'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
    
    // Speak the utterance
    window.speechSynthesis.speak(utterance);
  },
  
  // Get available voices
  getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.init()) {
        resolve([]);
        return;
      }
      
      // If voices are already loaded
      if (window.speechSynthesis.getVoices().length > 0) {
        resolve(window.speechSynthesis.getVoices());
      } else {
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });
  },
  
  // Generate feedback for exercise form
  generateFormFeedback(formIssue: string): string {
    const feedbackMessages = {
      range: [
        "Extend your range of motion a bit more",
        "Try to get a fuller stretch",
        "Great range of motion, keep it up",
        "Excellent extension!"
      ],
      speed: [
        "Slow down the movement",
        "Keep the pace more controlled",
        "Good tempo, keep it steady",
        "Maintain this controlled pace"
      ],
      posture: [
        "Watch your posture, keep your back straight",
        "Try to maintain a neutral spine position",
        "Align your shoulders and hips properly",
        "Good posture, keep your core engaged"
      ],
      symmetry: [
        "Try to keep both sides moving symmetrically",
        "Balance your effort between both sides",
        "Keep your movements even on both sides",
        "Good balance between left and right"
      ]
    };
    
    // Select appropriate feedback based on issue
    if (formIssue.includes('range')) {
      return feedbackMessages.range[Math.floor(Math.random() * feedbackMessages.range.length)];
    } else if (formIssue.includes('speed') || formIssue.includes('tempo')) {
      return feedbackMessages.speed[Math.floor(Math.random() * feedbackMessages.speed.length)];
    } else if (formIssue.includes('posture') || formIssue.includes('back') || formIssue.includes('spine')) {
      return feedbackMessages.posture[Math.floor(Math.random() * feedbackMessages.posture.length)];
    } else if (formIssue.includes('symmetry') || formIssue.includes('balance')) {
      return feedbackMessages.symmetry[Math.floor(Math.random() * feedbackMessages.symmetry.length)];
    }
    
    // Default encouragement
    return "Keep up the good work!";
  },
  
  // Generate rep counting voice
  speakRepCount(currentRep: number, totalReps: number): void {
    if (currentRep === 0) {
      this.speak("Starting exercise. Get ready.");
    } else if (currentRep === Math.floor(totalReps / 2)) {
      this.speak(`Halfway there! ${currentRep} out of ${totalReps} repetitions.`);
    } else if (currentRep === totalReps - 1) {
      this.speak("One more repetition to go!");
    } else if (currentRep === totalReps) {
      this.speak("Set complete! Well done.");
    } else if (currentRep % 5 === 0) {
      this.speak(`${currentRep} repetitions`);
    }
  },
  
  // Stop any ongoing speech
  stop(): void {
    if (this.init()) {
      window.speechSynthesis.cancel();
    }
  }
};

export default speechService;