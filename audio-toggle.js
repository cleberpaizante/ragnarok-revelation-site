const video = document.querySelector(".background-video");
const endingVideo = document.querySelector(".background-video--ending");
const backgroundShade = document.querySelector(".background-shade");
const toggle = document.querySelector("[data-audio-toggle]");
const label = toggle.querySelector("[data-audio-label]");
const volumeControl = document.querySelector("[data-video-volume]");
let endingVideoRequested = false;
let endingVideoActive = false;
let clickAudioContext;

video.volume = Number(volumeControl.value) / 100;
endingVideo.volume = video.volume;

function updateAudioToggle() {
	const audioEnabled = !video.muted;
	toggle.setAttribute("aria-pressed", String(audioEnabled));
	toggle.setAttribute("aria-label", audioEnabled ? "Desativar áudio" : "Ativar áudio");
	label.textContent = audioEnabled ? "DESATIVAR ÁUDIO" : "ATIVAR ÁUDIO";
}

function updateBackgroundTint() {
	backgroundShade.classList.toggle("is-normal", video.currentTime >= 103);
}

function playButtonSound() {
	if (!window.AudioContext) {
		console.warn("Este navegador não oferece suporte ao efeito sonoro.");
		return;
	}

	clickAudioContext = clickAudioContext || new AudioContext();
	if (clickAudioContext.state === "suspended") {
		clickAudioContext.resume().catch((error) => {
			console.warn("Não foi possível iniciar o efeito sonoro.", error);
		});
	}

	const startTime = clickAudioContext.currentTime;
	const oscillator = clickAudioContext.createOscillator();
	const gain = clickAudioContext.createGain();
	oscillator.type = "sine";
	oscillator.frequency.setValueAtTime(1000, startTime);
	oscillator.frequency.exponentialRampToValueAtTime(420, startTime + 0.5);
	gain.gain.setValueAtTime(0.0001, startTime);
	gain.gain.exponentialRampToValueAtTime(0.0585, startTime + 0.015);
	gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);
	oscillator.connect(gain);
	gain.connect(clickAudioContext.destination);
	oscillator.start(startTime);
	oscillator.stop(startTime + 0.66);
}

document.querySelectorAll("button:not(:disabled), a[href]").forEach((control) => {
	control.addEventListener("click", () => {
		if (!control.disabled) {
			playButtonSound();
		}
	});
});

document.querySelectorAll("[data-action-glow]").forEach((control) => {
	control.addEventListener("click", () => {
		const audioControls = control.closest(".audio-controls");
		const glowTarget = control.matches(".audio-toggle") && audioControls
			? audioControls
			: control;
		glowTarget.classList.remove("is-glowing");
		void glowTarget.offsetWidth;
		glowTarget.classList.add("is-glowing");
	});
});
document.addEventListener("animationend", (event) => {
	if (event.animationName === "action-button-glow") {
		event.target.classList.remove("is-glowing");
	}
});

function startEndingVideo() {
	if (endingVideoActive || video.currentTime < 103 || endingVideo.readyState < 2) {
		return;
	}

	endingVideoActive = true;
	endingVideo.currentTime = Math.max(0, video.currentTime - 103);
	endingVideo.muted = video.muted;
	video.pause();
	endingVideo.classList.add("is-active");
	endingVideo.play().catch((error) => {
		console.warn("Não foi possível reproduzir o trecho final em alta resolução.", error);
		endingVideoActive = false;
		endingVideo.classList.remove("is-active");
		video.currentTime = 0;
		video.play().catch((resumeError) => {
			console.warn("Não foi possível retomar o vídeo de fundo.", resumeError);
		});
	});
}

function prepareEndingVideo() {
	if (!endingVideoRequested && video.currentTime >= 100) {
		endingVideoRequested = true;
		endingVideo.load();
	}

	startEndingVideo();
}

video.addEventListener("timeupdate", () => {
	updateBackgroundTint();
	prepareEndingVideo();
});
video.addEventListener("loadedmetadata", updateBackgroundTint);
video.addEventListener("seeked", updateBackgroundTint);
endingVideo.addEventListener("canplay", startEndingVideo);
endingVideo.addEventListener("ended", () => {
	endingVideoActive = false;
	endingVideo.classList.remove("is-active");
	endingVideo.currentTime = 0;
	video.currentTime = 0;
	updateBackgroundTint();
	video.play().catch((error) => {
		console.warn("Não foi possível reiniciar o vídeo de fundo.", error);
	});
});

toggle.addEventListener("click", () => {
	video.muted = !video.muted;
	endingVideo.muted = video.muted;
	updateAudioToggle();
});

volumeControl.addEventListener("input", () => {
	const volume = Number(volumeControl.value) / 100;
	video.volume = volume;
	endingVideo.volume = volume;
	video.muted = volume === 0;
	endingVideo.muted = video.muted;
	updateAudioToggle();
});

function resumeBackgroundVideo() {
	const activeVideo = endingVideoActive ? endingVideo : video;
	if (!activeVideo.paused) {
		return;
	}

	activeVideo.play().catch((error) => {
		console.warn("Não foi possível retomar o vídeo de fundo.", error);
	});
}

window.addEventListener("pageshow", resumeBackgroundVideo);
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible") {
		resumeBackgroundVideo();
	}
});
