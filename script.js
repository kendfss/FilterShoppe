var originalImage = null;
var file = null;
var editingImage = null;
var criticalGreen = null;
var greenScreenBackground = null;
var blendingImage = null;


function setHoverEvents() {
  document.getElementById('editingImageCanvas').onmouseover = (event) => {
    document.getElementById('editingImageCanvas').style.display = 'none';
    document.getElementById('originalImageCanvas').style.display = 'inline';
  }
  document.getElementById('originalImageCanvas').onmouseout = (event) => {
    document.getElementById('editingImageCanvas').style.display = 'inline';
    document.getElementById('originalImageCanvas').style.display = 'none';
  }
}

setHoverEvents();

function getId(id) {
  return document.getElementById(id);
}
function quantize(rgbval) {
  if (rgbval > 255) {
    rgbval = 255;
  } else if (rgbval < 0) {
    rgbval = 0;
  }
  return parseInt(rgbval);
}

function toggleLoadGif() {
  var elem = document.getElementById('loadGif');
  if (elem.style.display == 'none') {
    var value = 'block';
  } else if (elem.style.display == 'block') {
    var value = 'none';
  }
  elem.style.display = value;
}
function togglePage(shown, hidden) {
	document.getElementById(shown).style.display = 'block';
	document.getElementById(hidden).style.display = 'none';
}
function filterImageToggle() {
  editingImage = (editingImage === null) ? originalImage : editingImage;
}
function setCriticalGreen() {
	slider = document.getElementById('criticalGreenSetter');
	criticalGreen = slider.value;
	if (greenScreenBackground !== null) applyGreenScreen(editingImageBACKUP, greenScreenBackground);
}
function isGreen(px) {
	if (criticalGreen == null) {
		if (px.getGreen() <= (px.getRed() + px.getBlue())) return false;
	} else {
		if (px.getGreen() < criticalGreen) return false;
	}
  return true;
}
function dimensions(img) {
	return [img.getWidth(), img.getHeight()]
}
function applyGreenScreen(fore, back) {
  var out = new SimpleImage(fore.getWidth(), fore.getHeight());
  back.setSize(fore.getWidth(), fore.getHeight());
  for (var px of fore.values()) {
    var x = px.getX();
    var y = px.getY();
    var opx = back.getPixel(x, y);
    var npx = out.getPixel(x, y);
    if (isGreen(px)) {
      npx.setAllFrom(opx);
    } else {
      npx.setAllFrom(px);
    }
  }
  editingImage = out;
  var canny = document.getElementById("editingImageCanvas");
	out.drawTo(canny);
}

function setBorderColour() {
	var can1 = document.getElementById("editingCanvas");
	var clr = document.getElementById("borderColourPicker");
	can1.style.backgroundColor = clr.value;
}

function swapCanvii() {
  let tmp = new SimpleImage(originalImage.getWidth(), originalImage.getHeight());
  originalImage = editingImage;
  editingImage = tmp;
  originalImage.drawTo(getId('originalImageCanvas'));
  editingImage.drawTo(getId('editingImageCanvas'));
}

function toggleZindex(frontID) {
  var ogic = "originalImageCanvas";
  var backID = (frontID === ogic) ? "editingImageCanvas" : ogic;
  frontCan = document.getElementById(frontID);
  backCan = document.getElementById(backID);
  frontCan.style.zIndex = 0;
  backCan.style.zIndex = -1;
}
function zoom(canID, inputID) {
  // toggleZindex(canID);
	var val = document.getElementById(inputID).value;
	var can = document.getElementById(canID);
	can.style.scale = val;
}
function resetZoom() {
	// var oCan = document.getElementById('originalImageCanvas');
	// var eCan = document.getElementById('editingImageCanvas');
	// var eVal = document.getElementById('editingZoomer').value;
	// oCan.style.scale = 1;
	// eCan.style.scale = 1;
	// document.getElementById('editingZoomer').value = 1;
	document.getElementById('editingZoomer').value = 1;
  zoom('originalImageCanvas', 'editingZoomer')
  zoom('editingImageCanvas', 'editingZoomer')
}


function removeBorders() {
  for (var e of document.getElementsByClassName('imageCanvas')) {
    e.style.border = "0px";
  }
}
function uploadOriginalImage() {
	var can = document.getElementById("originalImageCanvas");
	file = document.getElementById("originalImage");
	originalImage = new SimpleImage(file);
  originalImage.drawTo(can);
	if (editingImage === null) {revertImage()};
  removeBorders();
}
function resize(img, target) {
	tw = target.getWidth()
	iw = img.getWidth() 
}
function uploadGreenScreenBackground() {
	file = document.getElementById("greenScreenBackgroundImage");
	greenScreenBackground = new SimpleImage(file);
	greenScreenBackground.setSize(editingImage.getWidth(), editingImage.getHeight());
	alert(`dimensions(backgroundImage) = ${dimensions(greenScreenBackground)}`);
	applyGreenScreen(editingImage, greenScreenBackground);
}
function uploadBlendLayer() {
	file = document.getElementById("blendUpload");
	blendingImage = new SimpleImage(file);
}
function revertImage() {
  
	var eCan = document.getElementById('editingImageCanvas');
  originalImage.drawTo(eCan);
  originalImage.drawTo(getId('originalImageCanvas'));
	editingImage = originalImage;
	// editingCanvas.drawTo(eCan);
	
  
}
function commitImage() {
	var oCan = document.getElementById('originalImageCanvas');
  
	originalImage = new SimpleImage(editingImage.getWidth(), editingImage.getHeight());
	for (var px of originalImage.values()) {
		var x = px.getX();
		var y = px.getY();
		var epx = editingImage.getPixel(x, y);
		px.setAllFrom(epx);
	}
	originalImage.drawTo(oCan);
  
}
function swapPixels(px, opx) {
  var r = px.getRed();
  var g = px.getGreen();
  var b = px.getBlue();
  var or = opx.getRed();
  var og = opx.getGreen();
  var ob = opx.getBlue();
  px.setRed(or);
  px.setGreen(og);
  px.setBlue(ob);
  opx.setRed(r);
  opx.setGreen(g);
  opx.setBlue(b);
}
function flipVertical(img) {
  var h = img.getHeight();
  var w = img.getWidth();
  var c = Math.floor(h / 2)
  for (var y = 0; y < c; y++) {
    for (var x = 0; x < w; x++) {
      var px = img.getPixel(x, y);
      var ox = x;
      var oy = h - 1 - y;
      var opx = img.getPixel(ox, oy);
      swapPixels(px, opx)
    }
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function flipHorizontal(img) {
  var h = img.getHeight();
  var w = img.getWidth();
  var c = Math.floor(w / 2)
  for (var x=0; x < c; x++) {
    for (var y=0; y < h; y++) {
      var px = img.getPixel(x, y);
      var ox = w - 1 - x;
      var oy = y;
      var opx = img.getPixel(ox, oy);
      swapPixels(px, opx)
    }
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}

function associativeArrayProducer(list1, list2) {
    var dictionary = {};
    if (list1.length == list2.length) {
      for (var i=0; i < list1.length; i++) {
        dictionary[list1[i]] = list2[i];
      }
    } else {
      return null;
    }
    return dictionary
}

function primaryOptionToggler() {
	var selector = document.getElementById('primaryOptionSelector');
	var current = selector[selector.selectedIndex];
	var meta = document.getElementById('secondaryOptions');
	var panels = document.getElementsByClassName('secondaryOptionPanel');
	var panelDictionary = {};
	for (var option of selector) {
		if (option.value != 'none') {
			for (var panel of panels) {
				if (panel.id.indexOf(option.value) != -1) {
					panelDictionary[option.value] = panel.id;
				}
			}
		}
	}
	var panelKeys = Object.keys(panelDictionary);
	var panelIDs = Object.values(panelDictionary);
	if (current == 'none') {
		meta.style.display = 'none';
		for (var panelID of panelIDs) {
			var panel = document.getElementById(panelID);
			panel.style.display = 'none';
		}
	} else {
		meta.style.display = 'block';
		for (var key of panelKeys) {
			var val = panelDictionary[key];
			var panel = document.getElementById(val);
			if (key != current.value) {
				panel.style.display = 'none';
			} else {
				panel.style.display = 'block';
			}
		}
	}
}
function combinatorialToggler() {
	var selector = document.getElementById('combinatorialModeSelector');
	var current = selector[selector.selectedIndex].value;
	var meta = document.getElementById('combinatorialModePanels');
	var panels = document.getElementsByClassName('combinatorialModePanel');
	var panelDictionary = {};
	// build options dictionary
	for (var option of selector) {
		if (option.value != 'none') {
			for (var panel of panels) {
				if (panel.id.indexOf(option.value) != -1) {
					panelDictionary[option.value] = panel.id;
				}
			}
		}
	}
	var panelKeys = Object.keys(panelDictionary);
	var panelIDs = Object.values(panelDictionary);
	if (current == 'none') {
		meta.style.display = 'none';
		for (var panelID of panelIDs) {
			var panel = document.getElementById(panelID);
			panel.style.display = 'none';
		}
	} else {
		meta.style.display = 'block';
		for (var key of panelKeys) {
			var val = panelDictionary[key];
			var panel = document.getElementById(val);
			if (key != current) {
				panel.style.display = 'none';
			} else {
				panel.style.display = 'block';
			}
		}
	}
}
function flipToggler() {
	var selector = document.getElementById('flipSelector');
	var current = selector[selector.selectedIndex].value;
	if (current == 'h') {
		flipHorizontal(editingImage)
	} else if (current == 'v') {
		flipVertical(editingImage)
	}
}

function executeCustomFilter() {
	var body = document.getElementById('customFilterText').value;
	var space = document.getElementById('customFilterTarget');
	space.text = body;
	var name = document.getElementById('customFilterNameBox').value;
	var exe = name + '(editingImage)';
	eval(exe);
}
function executeCustomBlend() {
	var body = document.getElementById('customBlendText').value;
	var space = document.getElementById('customBlendTarget');
	space.text = body;
	var name = document.getElementById('customBlendNameBox').value;
	var exe = name+'(editingImage,blendingImage)';
	eval(exe);
}
function toggleCustomFilter() {
	selector = document.getElementById('filterSelector');
	current = selector[selector.selectedIndex];
	panel = document.getElementById('customFilterPanel');
	if (current.value == 'custom') {
		panel.style.display = 'block';
	} else {
		panel.style.display = 'none';
	}
}
function toggleCustomBlend() {
	selector = document.getElementById('blendModeSelector');
	current = selector[selector.selectedIndex];
	panel = document.getElementById('customBlendPanel');
	if (current.value == 'custom') {
		panel.style.display = 'block';
	} else {
		panel.style.display = 'none';
	}
}
function exampleToggle(target, example) {
	trigger = document.getElementById(target);
	example = document.getElementById(example);
	if (trigger.value == 'Hide Example') {
		example.style.display = 'none';
		trigger.value = 'Show Example';
	} else if (trigger.value == 'Show Example') {
		example.style.display = 'block';
		example.style.marginLeft = 'auto';
		example.style.marginRight = 'auto';
		trigger.value = 'Hide Example';
	}
}
function openInNewTab(url) {
	// from Rinto George at https://stackoverflow.com/a/11384018/11472248
	var win = window.open(url, '_blank');
	win.focus();
}




// Filters
// Filters
// Filters
// Filters
// Filters
// Filters
// Filters
// Filters

function applyGreyScale(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getBlue() + px.getGreen()) / 3;
    px.setBlue(avg);
    px.setGreen(avg);
    px.setRed(avg);
  }
  var canny = document.getElementById("editingImageCanvas");
  img.drawTo(canny);
}
function applySepia(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3;
    if (avg < 200) {
      px.setRed(avg + 50);
      px.setGreen(avg + 20);
      px.setBlue(avg - 10);
    } else {
      px.setRed(avg);
      px.setGreen(avg);
      px.setBlue(avg - 50);
    }
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyRouge(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3;
    if (avg < 127.5) {
      px.setRed(avg);
      px.setGreen(0);
      px.setBlue(0);
    } else {
      px.setRed(255);
      px.setGreen(2 * avg - 255);
      px.setBlue(2 * avg - 255);
    }
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyBRG(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3;
    var r = px.getRed();
    var b = px.getBlue();
    var g = px.getGreen();
    px.setRed(b);
    px.setGreen(r);
    px.setBlue(g);
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyGBR(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3;
    var r = px.getRed();
    var b = px.getBlue();
    var g = px.getGreen();
    px.setRed(g);
    px.setGreen(b);
    px.setBlue(r);
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyNegative(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3;
    var r = px.getRed();
    var b = px.getBlue();
    var g = px.getGreen();
    px.setRed(255 - r);
    px.setGreen(255 - g);
    px.setBlue(255 - b);
  }
	
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyAqua(img) {
  for (var px of img.values()) {
    px.setRed(0)
    px.setGreen((240 / 255) * px.getGreen())
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyLime(img) {
  for (var px of img.values()) {
    var avg = (px.getRed() + px.getGreen() + px.getBlue())
    px.setBlue((240 / 255) * px.getBlue())
    px.setRed(10)
    px.setGreen(230)
    px.setAlpha(avg * (5 / 13))
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function ensureInImage(coordinate, size) {
  if (coordinate < 0) {
    coordinate = Math.abs(coordinate);
  }
  if (coordinate > size) {
    while (coordinate > size) {
      coordinate -= size;
    }
  }
  return coordinate;
}
function getPixelNearby(image, x, y, diameter) {
    var dx = Math.random() * diameter - diameter / 2;
    var dy = Math.random() * diameter - diameter / 2;
    var nx = ensureInImage(x + dx, image.getWidth());
    var ny = ensureInImage(y + dy, image.getHeight());
    return image.getPixel(nx, ny);
}
function applyBlur(img) {
  console.log('blurring');
  var X = img.getWidth();
  var Y = img.getHeight();
  let output = new SimpleImage(X, Y);
  for (var px of img.values()) {
    var x = px.getX();
    var y = px.getY();
    if (Math.random() > 0.5) {
      var other = getPixelNearby(img, x, y, 10);
      output.setPixel(x, y, other);
      // img.setPixel(x, y, other);
    } else {
      output.setPixel(x, y, px);
      // img.setPixel(x, y, px);
    }
  }
  editingImage = output;
  var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
  console.log('blurred');
}


function applyTricolor(img) {
  var X = img.getWidth();
  var Y = img.getHeight();
  let output = new SimpleImage(X, Y);
  for (var px of output.values()) {
    let x = px.getX();
    let y = px.getY();
    let ipx = img.getPixel(x, y);
    if (px.getX() < (img.getWidth() / 3)){
      px.setBlue(ipx.getBlue() - 120);
    }
    else if (px.getX() <= 2 * (img.getWidth() / 3)) {
      px.setGreen(ipx.getGreen() - 120);
    }
    else if (px.getX() >= 2 * (img.getWidth() / 3)) {
      px.setRed(ipx.getRed() - 120);
      px.setGreen(ipx.getGreen() - 120);
    }
  }
  editingImage = output;
	var canny = document.getElementById("editingImageCanvas");
	inpt.drawTo(canny);
}

function applyRGInversion(img) {
  var X = img.getWidth();
  var Y = img.getHeight();
  let output = new SimpleImage(X, Y);
  for (var px of output.values()) {
    let x = px.getX();
    let y = px.getY();
    let ipx = img.getPixel(x, y);
    var nuGreen = ipx.getRed();
    var nuRed = ipx.getGreen();
    px.setGreen(nuGreen);
    px.setRed(nuRed);
    px.setBlue(ipx.getBlue());
  }
  editingImage = output
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyRBInversion(img) {
  var X = img.getWidth();
  var Y = img.getHeight();
  let output = new SimpleImage(X, Y);
  for (var px of output.values()) {
    let x = px.getX();
    let y = px.getY();
    let ipx = img.getPixel(x, y);
    var nuBlue = px.getRed();
    var nuRed = px.getBlue();
    px.setBlue(nuBlue);
    px.setRed(nuRed);
    px.setGreen(ipx.getGreen());
  }
  editingImage = output;
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyGBInversion(img) {
  var X = img.getWidth();
  var Y = img.getHeight();
  let output = new SimpleImage(X, Y);
  for (var px of output.values()) {
    let x = px.getX();
    let y = px.getY();
    let ipx = img.getPixel(x, y);
    var nuBlue = px.getGreen();
    var nuGreen = px.getBlue();
    px.setBlue(nuBlue);
    px.setGreen(nuGreen);
    px.setRed(ipx.getRed());
  }
  editingImage = output;
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyHorizontalRainbow(image) {
	// this function was directly lifted from the programming foundations cource resource site
	var height = image.getHeight();
	for (var pixel of image.values()) {
		var y = pixel.getY();
		var avg = (pixel.getRed() + pixel.getGreen() + pixel.getBlue()) / 3;
		if (y < height / 7) {
			//red
			if (avg < 128) {
				pixel.setRed(2 * avg);
				pixel.setGreen(0);
				pixel.setBlue(0);
			} else {
				pixel.setRed(255);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 2 / 7) {
			//orange
			if (avg < 128) {
				pixel.setRed(2 * avg);
				pixel.setGreen(0.8 * avg);
				pixel.setBlue(0);
			} else {
				pixel.setRed(255);
				pixel.setGreen(1.2 * avg - 51);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 3 / 7) {
			//yellow
			if (avg < 128) {
				pixel.setRed(2 * avg);
				pixel.setGreen(2 * avg);
				pixel.setBlue(0);
			} else {
				pixel.setRed(255);
				pixel.setGreen(255);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 4 / 7) {
			//green
			if (avg < 128) {
				pixel.setRed(0);
				pixel.setGreen(2 * avg);
				pixel.setBlue(0);
			} else {
				pixel.setRed(2 * avg - 255);
				pixel.setGreen(255);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 5 / 7) {
			//blue
			if (avg < 128) {
				pixel.setRed(0);
				pixel.setGreen(0);
				pixel.setBlue(2 * avg);
			} else {
				pixel.setRed(2 * avg - 255);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(255);
			}
		} else if (y < height * 6 / 7) {
			//indigo
			if (avg < 128) {
				pixel.setRed(.8 * avg);
				pixel.setGreen(0);
				pixel.setBlue(2 * avg);
			} else {
				pixel.setRed(1.2 * avg - 51);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(255);
			}
		} else {
			//violet
			if (avg < 128) {
				pixel.setRed(1.6 * avg);
				pixel.setGreen(0);
				pixel.setBlue(1.6 * avg);
			} else {
				pixel.setRed(0.4*avg + 153);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(0.4 * avg+153);
			}
		}
	}
	var canny = document.getElementById("editingImageCanvas");
	image.drawTo(canny);
}
function applyVerticalRainbow(image) {
	// this function was directly lifted from the programming foundations cource resource site
	var height = image.getWidth();
	for (var pixel of image.values()) {
		var y = pixel.getX();
		var avg = (pixel.getRed() + pixel.getGreen() + pixel.getBlue()) / 3;
		if (y < height / 7) {
			//red
			if (avg < 128) {
				pixel.setRed(2 * avg);
				pixel.setGreen(0);
				pixel.setBlue(0);
			} else {
				pixel.setRed(255);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 2 / 7) {
			//orange
			if (avg < 128) {
				pixel.setRed(2 * avg);
				pixel.setGreen(0.8 * avg);
				pixel.setBlue(0);
			} else {
				pixel.setRed(255);
				pixel.setGreen(1.2 * avg - 51);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 3 / 7) {
			//yellow
			if (avg < 128) {
				pixel.setRed(2 * avg);
				pixel.setGreen(2 * avg);
				pixel.setBlue(0);
			} else {
				pixel.setRed(255);
				pixel.setGreen(255);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 4 / 7) {
			//green
			if (avg < 128) {
				pixel.setRed(0);
				pixel.setGreen(2 * avg);
				pixel.setBlue(0);
			} else {
				pixel.setRed(2 * avg - 255);
				pixel.setGreen(255);
				pixel.setBlue(2 * avg - 255);
			}
		} else if (y < height * 5 / 7) {
			//blue
			if (avg < 128) {
				pixel.setRed(0);
				pixel.setGreen(0);
				pixel.setBlue(2 * avg);
			} else {
				pixel.setRed(2 * avg -255);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(255);
			}
		} else if (y < height * 6 / 7) {
			//indigo
			if (avg < 128) {
				pixel.setRed(.8 * avg);
				pixel.setGreen(0);
				pixel.setBlue(2 * avg);
			} else {
				pixel.setRed(1.2 * avg - 51);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(255);
			}
		} else {
			//violet
			if (avg < 128) {
				pixel.setRed(1.6 * avg);
				pixel.setGreen(0);
				pixel.setBlue(1.6 * avg);
			} else {
				pixel.setRed(0.4 * avg + 153);
				pixel.setGreen(2 * avg - 255);
				pixel.setBlue(0.4 * avg + 153);
			}
		}
	}
	var canny = document.getElementById("editingImageCanvas");
	image.drawTo(canny);
}
function applyStochasm(img) {
  var X = img.getWidth()
  var Y = img.getHeight()
  var dimDict = {}
  for (var i = 0; i < 7; i++) {
    dimDict[Math.floor(X / i)] = Math.floor(Y/i)
  }
  xL = Object.keys(dimDict)
  yL = Object.values(dimDict)
  for (var j = 0; j < 7; j++) {
    var x = xL[j]
    var y = yL[j]
    for (var px of img.values()) {
      var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3
      var r = Math.floor(Math.random() * avg / Math.abs(avg - px.getRed()))
      var g = Math.floor(Math.random() * avg / Math.abs(avg - px.getGreen()))
      var b = Math.floor(Math.random() * avg / Math.abs(avg - px.getBlue()))
      var xp = px.getX()
      var yp = px.getY()
      if (j === 0) {
        if ((xp < x) && (yp < x)) {
          px.setRed(r) 
          px.setGreen(g)
          px.setBlue(b)
        } 
      } else {
        if ((xp < x) && (xp > xL[j - 1]) && (yp < y) && (yp > yL[j - 1])) {
          px.setRed(r)
          px.setGreen(g)
          px.setBlue(b)
        } else {
          px.setRed(b)
          px.setGreen(r)
          px.setBlue(g)
        }
      }
    }
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyGhostburn(img) {
  var X = img.getWidth()
  var Y = img.getHeight()
  var dimDict = {}
  for (var i = 0; i < 7; i++) {
    dimDict[Math.floor(X / i)] = Math.floor(Y / i)
  }
  xL = Object.keys(dimDict)
  yL = Object.values(dimDict)
  for (var j = 0; j < 7; j++) {
    var x = xL[j]
    var y = yL[j]
    for (var px of img.values()) {
      var avg = (px.getRed() + px.getGreen() + px.getBlue())/3
      var r = Math.floor(avg / Math.abs(avg - px.getRed()))
      var g = Math.floor(avg / Math.abs(avg - px.getGreen()))
      var b = Math.floor(avg / Math.abs(avg - px.getBlue()))
      var xp = px.getX()
      var yp = px.getY()
      if  ((xp >= xL) && (yp >= yL)) {
        px.setRed(r);
        px.setGreen(g);
        px.setBlue(b);
      } else {
        px.setRed(g);
        px.setGreen(r);
        px.setBlue(b);
      }
    }
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyForwardDistribute(img) {
  var vals = img.values();
  var X = img.getWidth();
  var Y = img.getHeight();
  for (var i = 0; i < vals.length; i++) {
    var j = Math.floor(Math.random() * vals.length);
    var px = vals[j];
    var x = px.getX();
    var y = px.getY();
    var ox = Math.abs(x + (X - x) * Math.random());
    var oy = Math.abs(y + (Y - y) * Math.random());
    var other = img.getPixel(ox, oy);
    px.setAllFrom(other);
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyBackwardDistribute(img) {
  var vals = img.values();
  var times = Math.floor(Math.random() * (vals.length + 1));
  var X = img.getWidth();
  var Y = img.getHeight();
  for (var i = 0; i < times; i++) {
    var j = Math.floor(Math.random() * vals.length);
    var px = vals[j];
    var x = px.getX();
    var y = px.getY();
    var ox = Math.abs(x - x * Math.random());
    var oy = Math.abs(y - y * Math.random());
    var other = img.getPixel(ox, oy);
    px.setAllFrom(other);
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}
function applyLuckyShuffle(img) {
  var vals = img.values();
  var times = Math.floor(Math.random() * vals.length);
  var X = img.getWidth();
  var Y = img.getHeight();
  for (var i = 0; i < times; i++) {
    var m = Math.random();
    var n = Math.random();
    if (m > 0.5) {
      var ox = x + (X - x) * Math.random();
    } else {
      var ox = x - x * Math.random();
    }
    if (n > 0.5) {
      var oy = y + (Y - y) * Math.random();
    } else {
      var oy = y - y * Math.random();
    }
    var j = Math.floor(Math.random() * vals.length);
    var px = vals[j];
    var x = px.getX();
    var y = px.getY();
    var other = img.getPixel(ox, oy);
    var r = px.getRed();
    var or = other.getRed();
    var g = px.getGreen();
    var og = other.getGreen();
    var b = px.getBlue();
    var ob = other.getBlue();
    px.setRed(or);
    px.setGreen(og);
    px.setBlue(ob);
    other.setRed(r);
    other.setGreen(g);
    other.setBlue(b);
  }
	var canny = document.getElementById("editingImageCanvas");
	img.drawTo(canny);
}











// Blending
// Blending
// Blending
// Blending
// Blending
// Blending
// Blending
// Blending
function applyPlusLighter(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x , y);
    opx = other.getPixel(x , y);
    r = ((px.getRed() / 255) + (bpx.getRed() / 255)) * 255;
    b = ((px.getBlue() / 255) + (bpx.getBlue() / 255)) * 255;
    g = ((px.getGreen() / 255) + (bpx.getGreen() / 255)) * 255;
    if (r <= 255) opx.setRed(r);
    if (r > 255) opx.setRed(255);
    if (b <= 255) opx.setBlue(b);
    if (b > 255) opx.setBlue(255);
    if (g <= 255) opx.setGreen(g);
    if (g > 255) opx.setGreen(255);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);
}
function applyPlusDarker(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = ((px.getRed() / 255) + (bpx.getRed()/255)) * 255;
    b = ((px.getBlue() / 255) + (bpx.getBlue()/255)) * 255;
    g = ((px.getGreen() / 255) + (bpx.getGreen()/255)) * 255;
    if (r <= 0) opx.setRed(0);
    if (r > 0) opx.setRed(r);
    if (b <= 0) opx.setBlue(0);
    if (b > 0) opx.setBlue(b);
    if (g <= 0) opx.setGreen(0);
    if (g > 0) opx.setGreen(g);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}    
function applySubtract(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = px.getRed();
    g = px.getGreen();
    b = px.getBlue();
    br = bpx.getRed();
    bg = bpx.getGreen();
    bb = bpx.getBlue();
    if (r > br) opx.setRed(px.getRed() - bpx.getRed());
    if (r <= br) opx.setRed(0);
    if (b > bb) opx.setBlue(px.getBlue() - bpx.getBlue());
    if (b <= bb) opx.setBlue(0);
    if (g > bg) opx.setGreen(px.getGreen() - bpx.getGreen());
    if (g <= bg) opx.setGreen(0);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyDifference(fore, back) {
    back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
    var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
    for (var px of fore.values()) {
      x = px.getX();
      y = px.getY();
      bpx = back.getPixel(x, y);
      opx = other.getPixel(x, y);
      r = px.getRed();
      g = px.getGreen();
      b = px.getBlue();
      br = bpx.getRed();
      bg = bpx.getGreen();
      bb = bpx.getBlue();
      if (r > br) opx.setRed(px.getRed() - bpx.getRed());
      if (r < br) opx.setRed(Math.abs(px.getRed() - bpx.getRed()));
      if (r == br) opx.setRed(255 * Math.round(Math.random()));
      if (b > bb) opx.setBlue(px.getBlue() - bpx.getBlue());
      if (b < bb) opx.setBlue(Math.abs(px.getBlue() - bpx.getBlue()));
      if (b == bb) opx.setBlue(255 * Math.round(Math.random()));
      if (g > bg) opx.setGreen(px.getGreen() - bpx.getGreen());
      if (g < bg) opx.setGreen(Math.abs(px.getGreen() - bpx.getGreen()));
      if (g == bg) opx.setGreen(255 * Math.round(Math.random()));
    }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyDarkenOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.min(px.getRed(), bpx.getRed()));
    opx.setBlue(Math.min(px.getBlue(), bpx.getBlue()));
    opx.setGreen(Math.min(px.getGreen(), bpx.getGreen()));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.max(px.getRed(), bpx.getRed()));
    opx.setBlue(Math.max(px.getBlue(), bpx.getBlue()));
    opx.setGreen(Math.max(px.getGreen(), bpx.getGreen()));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}

function applyDarkenRedOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.min(px.getRed(), bpx.getRed()));
    opx.setGreen(px.getGreen());
    opx.setBlue(px.getBlue());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenRedOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.max(px.getRed(), bpx.getRed()));
    opx.setGreen(px.getGreen());
    opx.setBlue(px.getBlue());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}

function applyDarkenGreenOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setGreen(Math.min(px.getGreen(), bpx.getGreen()));
    opx.setRed(px.getRed());
    opx.setBlue(px.getBlue());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenGreenOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setGreen(Math.max(px.getGreen(), bpx.getGreen()));
    opx.setRed(px.getRed());
    opx.setBlue(px.getBlue());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}

function applyDarkenBlueOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setBlue(Math.min(px.getBlue(), bpx.getBlue()));
    opx.setRed(px.getRed());
    opx.setGreen(px.getGreen());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenBlueOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setBlue(Math.max(px.getBlue(), bpx.getBlue()));
    opx.setRed(px.getRed());
    opx.setGreen(px.getGreen());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}

function applyDarkenRedGreenOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.min(px.getRed(), bpx.getRed()));
    opx.setGreen(Math.min(px.getGreen(), bpx.getGreen()));
    opx.setBlue(px.getBlue());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenRedGreenOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.max(px.getRed(), bpx.getRed()));
    opx.setGreen(Math.max(px.getGreen(), bpx.getGreen()));
    opx.setBlue(px.getBlue());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}

function applyDarkenRedBlueOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.min(px.getRed(), bpx.getRed()));
    opx.setBlue(Math.min(px.getBlue(), bpx.getBlue()));
    opx.setGreen(px.getGreen());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenRedBlueOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setRed(Math.max(px.getRed(), bpx.getRed()));
    opx.setBlue(Math.max(px.getBlue(), bpx.getBlue()));
    opx.setGreen(px.getGreen());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}

function applyDarkenGreenBlueOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setBlue(Math.min(px.getBlue(), bpx.getBlue()));
    opx.setGreen(Math.min(px.getGreen(), bpx.getGreen()));
    opx.setRed(px.getRed());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyLightenGreenBlueOnly(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    opx.setBlue(Math.max(px.getBlue(), bpx.getBlue()));
    opx.setGreen(Math.max(px.getGreen(), bpx.getGreen()));
    opx.setRed(px.getRed());
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}



function gw3c(rgb) {
  if (rgb <= 0.25) return (rgb*(4 + (rgb * (16 * rgb - 12))));
  if (rgb > 0.25) return (rgb**(1 / 2));
}
function applyW3CSoftlight(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = px.getRed() / 255;
    g = px.getGreen() / 255;
    b = px.getBlue() / 255;
    br = bpx.getRed() / 255;
    bg = bpx.getGreen() / 255;
    bb = bpx.getBlue() / 255;
    if (br > 0.5) opx.setRed(255 * (r + (2 * br - 1) * (gw3c(r) - r)));
    if (br <= 0.5) opx.setRed(255 * (r - (1 - 2 * br) * r *(1 - r)));
    if (bg > 0.5) opx.setGreen(255 * (g + (2 * bg - 1) * (gw3c(g) - g)));
    if (bg <= 0.5) opx.setGreen(255 * (g - (1 - 2 * bg) * g * (1 - g)));
    if (bb > 0.5) opx.setBlue(255 * (b + (2 * bb - 1) * (gw3c(b) - b)));
    if (br <= 0.5) opx.setBlue(255 * (b - (1 - 2 * bb) * b * (1 - b)));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyIllusionsHUSoftlight(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = px.getRed() / 255;
    g = px.getGreen() / 255;
    b = px.getBlue() / 255;
    br = bpx.getRed() / 255;
    bg = bpx.getGreen() / 255;
    bb = bpx.getBlue() / 255;
    opx.setRed(255 * (r ** (2 ** (2 * (0.5 - br)))));
    opx.setGreen(255 * (g ** (2 ** (2 * (0.5 - bg)))));
    opx.setBlue(255 * (b ** (2 ** (2 * (0.5 - bb)))));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyPegtopSoftlight(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x,y);
    opx = other.getPixel(x,y);
    r = px.getRed() / 255;
    g = px.getGreen() / 255;
    b = px.getBlue() / 255;
    br = bpx.getRed() / 255;
    bg = bpx.getGreen() / 255;
    bb = bpx.getBlue() / 255;
    opx.setRed(255 * (( 1 - 2 * br) * (r ** 2) + (2 * br * r)));
    opx.setGreen(255 * (( 1 - 2 * bg) * (g ** 2) + (2 * bg * g)));
    opx.setBlue(255 * (( 1 - 2 * bb) * (b ** 2) + (2 * bb * b)));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyPegtopHappyAccident1(fore, back) {
  // Take two stochastic blurs of the same imageand run them here for interesting contrasts
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = px.getRed() / 255;
    g = px.getGreen() / 255;
    b = px.getBlue() / 255;
    br = bpx.getRed() / 255;
    bg = bpx.getGreen() / 255;
    bb = bpx.getBlue() / 255;
    opx.setRed(255 * (1 - 2 * br) * (r ** 2) + (2 * br * r));
    opx.setGreen(255 * (1 - 2 * bg) * (g ** 2) + (2 * bg * g));
    opx.setBlue(255 * (1 - 2 * bb) * (b ** 2) + (2 * bb * b));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);
}
function applyPhotoShopSoftlight(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = px.getRed() / 255;
    g = px.getGreen() / 255;
    b = px.getBlue() / 255;
    br = bpx.getRed() / 255;
    bg = bpx.getGreen() / 255;
    bb = bpx.getBlue() / 255;
    if (br >= 0.5) opx.setRed(255 * (2 * r * br + (r ** 2) * (1 - 2 * br)));
    if (br < 0.5) opx.setRed(255 * (2 * r * (1-br)+(r ** (1/2))*((2 * br) - 1)));
    if (bg >= 0.5) opx.setGreen(255 * (2 * g * bg + (g ** 2) * (1 - 2 * bg)));
    if (bg < 0.5) opx.setGreen(255 * (2 * g * (1 - bg) + (g ** (1 / 2)) * ((2 * bg) - 1)));
    if (bb >= 0.5) opx.setBlue(255 * (2 * b * bb + (b ** 2) * (1 - 2 * bb)));
    if (bb < 0.5) opx.setBlue(255 * (2 * b * (1 - bb) + (b ** (1 / 2)) * ((2 * bb) - 1)));
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyOverlay(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    bpx = back.getPixel(x, y);
    opx = other.getPixel(x, y);
    r = px.getRed() / 255;
    g = px.getGreen() / 255;
    b = px.getBlue() / 255;
    br = bpx.getRed() / 255;
    bg = bpx.getGreen() / 255;
    bb = bpx.getBlue() / 255;
    if (r >= 0.5) opx.setRed(255 * (1 - (2 * (1 - r) * (1 - br))));
    if (r < 0.5) opx.setRed(255 * r * br);
    if (g >= 0.5) opx.setGreen(255 * (1 - (2 * (1 - g) * (1 - bg))));
    if (g < 0.5) opx.setGreen(255 * g * bg);
    if (b >= 0.5) opx.setBlue(255 * (1 - (2 * (1 - b) * (1 - bb))));
    if (b < 0.5) opx.setBlue(255 * b * bb);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyMultiply(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    opx = other.getPixel(x, y);
    bpx = back.getPixel(x, y);
    r = ((px.getRed() / 255) * (bpx.getRed() / 255)) * 255;
    b = ((px.getBlue() / 255) * (bpx.getBlue() / 255)) * 255;
    g = ((px.getGreen() / 255) * (bpx.getGreen() / 255)) * 255;
    opx.setRed(r);
    opx.setBlue(b);
    opx.setGreen(g);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyDivide(fore,back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    opx = other.getPixel(x, y);
    bpx = back.getPixel(x, y);
    r = ((px.getRed() / 255) / (bpx.getRed() / 255)) * 255;
    b = ((px.getBlue() / 255) / (bpx.getBlue() / 255)) * 255;
    g = ((px.getGreen() / 255) / (bpx.getGreen() / 255)) * 255;
    opx.setRed(r);
    opx.setBlue(b);
    opx.setGreen(g);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);

}
function applyScreen(fore, back) {
  back.setSize(dimensions(fore)[0], dimensions(fore)[1]);
  var other = new SimpleImage(dimensions(fore)[0], dimensions(fore)[1]);
  for (var px of fore.values()) {
    x = px.getX();
    y = px.getY();
    opx = other.getPixel(x, y);
    bpx = back.getPixel(x, y);
    r = 255 - ((255 - px.getRed()) * (255 - bpx.getRed()));
    b = 255 - ((255 - px.getBlue()) * (255 - bpx.getBlue()));
    g = 255 - ((255 - px.getGreen()) * (255 - bpx.getGreen()));
    opx.setRed(r);
    opx.setBlue(b);
    opx.setGreen(g);
  }
	editingImage = other;
  var canny = document.getElementById("editingImageCanvas");
	other.drawTo(canny);
}