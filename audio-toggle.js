const video = document.querySelector(".background-video");
const endingVideo = document.querySelector(".background-video--ending");
const backgroundShade = document.querySelector(".background-shade");
const toggle = document.querySelector("[data-audio-toggle]");
const label = toggle.querySelector("[data-audio-label]");
const volumeControl = document.querySelector("[data-video-volume]");
const siteShell = document.querySelector(".site-shell");
const signupTrigger = document.querySelector("[data-signup-open]");
const signupScreen = document.querySelector("[data-signup-screen]");
const signupClose = document.querySelector("[data-signup-close]");
const signupForm = document.querySelector("[data-signup-form]");
const signupStatus = document.querySelector("[data-signup-status]");
const ENDING_START_TIME = 103;
const LOOP_STOP_TIME = 105;
const RESTART_DELAY_MS = 10000;
const SHATTER_DURATION_MS = 6200;
let endingVideoRequested = false;
let endingVideoActive = false;
let videoStoppedAtLimit = false;
let clickAudioContext;
let shatterTimeout;

const shardClips = [
	"50% 50%, 0 0, 38% 0, 0 31%",
	"50% 50%, 38% 0, 72% 0, 100% 23%",
	"50% 50%, 100% 23%, 100% 55%",
	"50% 50%, 100% 55%, 100% 100%, 64% 100%",
	"50% 50%, 64% 100%, 34% 100%, 0 72%",
	"50% 50%, 0 72%, 0 33%",
	"50% 50%, 0 33%, 0 0",
	"50% 50%, 72% 0, 100% 0, 100% 23%"
];

const shardFlights = [
	["-32vw", "-35vh", "-15deg"],
	["-12vw", "-40vh", "12deg"],
	["30vw", "-32vh", "18deg"],
	["40vw", "-8vh", "24deg"],
	["28vw", "38vh", "-17deg"],
	["-22vw", "38vh", "16deg"],
	["-40vw", "4vh", "-22deg"],
	["12vw", "-26vh", "14deg"]
];

video.volume = Number(volumeControl.value) / 100;
endingVideo.volume = video.volume;

function updateAudioToggle() {
	const audioEnabled = !video.muted;
	toggle.setAttribute("aria-pressed", String(audioEnabled));
	toggle.setAttribute("aria-label", audioEnabled ? "Desativar áudio" : "Ativar áudio");
	label.textContent = audioEnabled ? "DESATIVAR ÁUDIO" : "ATIVAR ÁUDIO";
}

function updateBackgroundTint() {
	backgroundShade.classList.toggle("is-normal", video.currentTime >= ENDING_START_TIME);
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
	if (endingVideoActive || video.currentTime < ENDING_START_TIME || endingVideo.readyState < 2) {
		return;
	}

	endingVideoActive = true;
	endingVideo.currentTime = Math.max(0, video.currentTime - ENDING_START_TIME);
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

function restartVideoLoop() {
	videoStoppedAtLimit = false;
	endingVideoActive = false;
	endingVideo.classList.remove("is-active");
	endingVideo.currentTime = 0;
	video.currentTime = 0;
	updateBackgroundTint();
	video.play().catch((error) => {
		console.warn("Não foi possível reiniciar o vídeo de fundo.", error);
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
endingVideo.addEventListener("timeupdate", () => {
	if (endingVideoActive && !videoStoppedAtLimit
		&& endingVideo.currentTime >= LOOP_STOP_TIME - ENDING_START_TIME) {
		videoStoppedAtLimit = true;
		endingVideo.currentTime = LOOP_STOP_TIME - ENDING_START_TIME;
		endingVideo.pause();
		window.setTimeout(restartVideoLoop, RESTART_DELAY_MS);
	}
});
endingVideo.addEventListener("ended", restartVideoLoop);

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
	if (videoStoppedAtLimit) {
		return;
	}

	const activeVideo = endingVideoActive ? endingVideo : video;
	activeVideo.play().catch((error) => {
		console.warn("Não foi possível retomar o vídeo de fundo.", error);
		if (activeVideo === endingVideo) {
			endingVideoActive = false;
			endingVideo.classList.remove("is-active");
			endingVideo.currentTime = 0;
			video.currentTime = 0;
			updateBackgroundTint();
			video.play().catch((resumeError) => {
				console.warn("Não foi possível retomar o vídeo de fundo.", resumeError);
			});
		}
	});
}

window.addEventListener("pageshow", resumeBackgroundVideo);
window.addEventListener("focus", resumeBackgroundVideo);
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible") {
		resumeBackgroundVideo();
	}
});

function createShatterFragments() {
	document.querySelectorAll(".shatter-fragment").forEach((fragment) => fragment.remove());

	shardClips.forEach((clip, index) => {
		const fragment = siteShell.cloneNode(true);
		const [x, y, rotation] = shardFlights[index];
		fragment.classList.add("shatter-fragment");
		fragment.setAttribute("aria-hidden", "true");
		fragment.removeAttribute("inert");
		fragment.style.setProperty("--shard-clip", `polygon(${clip})`);
		fragment.style.setProperty("--shard-x", x);
		fragment.style.setProperty("--shard-y", y);
		fragment.style.setProperty("--shard-rotation", rotation);
		fragment.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
		fragment.querySelectorAll("a, button, input").forEach((element) => {
			element.setAttribute("tabindex", "-1");
		});
		document.body.append(fragment);
	});
}

function openSignupScreen() {
	createShatterFragments();
	document.body.classList.add("signup-open");
	signupScreen.classList.add("is-open");
	signupScreen.setAttribute("aria-hidden", "false");
	siteShell.inert = true;
	siteShell.classList.add("is-shattering");

	window.clearTimeout(shatterTimeout);
	shatterTimeout = window.setTimeout(() => {
		siteShell.classList.add("is-hidden");
		document.querySelectorAll(".shatter-fragment").forEach((fragment) => fragment.remove());
		signupForm.elements.username.focus();
	}, SHATTER_DURATION_MS);
}

function closeSignupScreen() {
	window.clearTimeout(shatterTimeout);
	signupScreen.classList.remove("is-open");
	signupScreen.setAttribute("aria-hidden", "true");
	document.body.classList.remove("signup-open");
	siteShell.inert = false;
	siteShell.classList.remove("is-shattering", "is-hidden");
	document.querySelectorAll(".shatter-fragment").forEach((fragment) => fragment.remove());
	signupTrigger.focus();
}

signupTrigger.addEventListener("click", openSignupScreen);
signupClose.addEventListener("click", closeSignupScreen);
signupScreen.addEventListener("click", (event) => {
	if (event.target === signupScreen) {
		closeSignupScreen();
	}
});
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && signupScreen.classList.contains("is-open")) {
		closeSignupScreen();
	}
});
signupForm.addEventListener("submit", (event) => {
	event.preventDefault();
	signupStatus.dataset.state = "info";
	signupStatus.textContent = "O cadastro será ativado em breve. Seus dados não foram enviados.";
});
