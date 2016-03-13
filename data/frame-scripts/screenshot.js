addMessageListener("fs/screenshot", makeScreenshot);

function makeScreenshot(payload) {
    var startX = content.startX || 0;
    var startY = content.startY || 0;
    var width = content.innerWidth;
    var height = content.innerHeight;
    // Create canvas to draw window unto
    var canvas = content.document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
    canvas.width = width;
    canvas.height = height;
    // Create context for drawing, draw the old window unto the canvas
    var context = canvas.getContext("2d");
    context.drawWindow(content, startX, startY, width, height, "rgb(255,255,255)");
    // Save context as png
    var image = canvas.toDataURL('image/png');
    var report = payload.data;
    console.log(report);
    report["screenshot"] = image;
    console.log(report);
    sendAsyncMessage("got-screenshot", report);
}
