const video = document.querySelector(".background-video");
const toggle = document.querySelector("[data-audio-toggle]");
const label = toggle.querySelector("[data-audio-label]");

toggle.addEventListener("click", () => {
	video.muted = !video.muted;
	const audioEnabled = !video.muted;
	toggle.setAttribute("aria-pressed", String(audioEnabled));
	toggle.setAttribute("aria-label", audioEnabled ? "Desativar áudio" : "Ativar áudio");
	label.textContent = audioEnabled ? "DESATIVAR ÁUDIO" : "ATIVAR ÁUDIO";
});

function resumeBackgroundVideo() {
	if (!video.paused) {
		return;
	}

	video.play().catch((error) => {
		console.warn("Não foi possível retomar o vídeo de fundo.", error);
	});
}

window.addEventListener("pageshow", resumeBackgroundVideo);
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible") {
		resumeBackgroundVideo();
	}
});
