window.initializeBoards = () => {
    const playerCanvas = document.getElementById("playerBoard");
    const opponentCanvas = document.getElementById("opponentBoard");
    const ctx1 = playerCanvas.getContext("2d");
    const ctx2 = opponentCanvas.getContext("2d");

    ctx1.fillStyle = "#cceeff";
    ctx1.fillRect(0, 0, playerCanvas.width, playerCanvas.height);

    ctx2.fillStyle = "#ffcccc";
    ctx2.fillRect(0, 0, opponentCanvas.width, opponentCanvas.height);
};
