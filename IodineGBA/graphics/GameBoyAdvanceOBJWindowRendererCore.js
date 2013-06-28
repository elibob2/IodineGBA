"use strict";
/*
 * This file is part of IodineGBA
 *
 * Copyright (C) 2012-2013 Grant Galitz
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */
function GameBoyAdvanceOBJWindowRenderer(gfx) {
	this.gfx = gfx;
	this.preprocess();
}
GameBoyAdvanceOBJWindowRenderer.prototype.renderNormalScanLine = function (line, lineBuffer, OBJBuffer, BG0Buffer, BG1Buffer, BG2Buffer, BG3Buffer) {
	//Arrange our layer stack so we can remove disabled and order for correct edge case priority:
	OBJBuffer = (this.gfx.WINOBJOBJOutside) ? OBJBuffer : null;
	BG0Buffer = (this.gfx.WINOBJBG0Outside) ? BG0Buffer: null;
	BG1Buffer = (this.gfx.WINOBJBG1Outside) ? BG1Buffer: null;
	BG2Buffer = (this.gfx.WINOBJBG2Outside) ? BG2Buffer: null;
	BG3Buffer = (this.gfx.WINOBJBG3Outside) ? BG3Buffer: null;
	var layerStack = this.gfx.cleanLayerStack(OBJBuffer, BG0Buffer, BG1Buffer, BG2Buffer, BG3Buffer);
	var stackDepth = layerStack.length;
	var stackIndex = 0;
	var OBJWindowBuffer = this.gfx.objRenderer.renderWindowScanLine(line);
	//Loop through each pixel on the line:
	for (var pixelPosition = 0, currentPixel = 0, workingPixel = 0, lowerPixel = 0; pixelPosition < 240; ++pixelPosition) {
		//If non-transparent OBJ (Marked for OBJ WIN) pixel detected:
		if (OBJWindowBuffer[pixelPosition] < this.gfx.transparency) {
			//Start with backdrop color:
			lowerPixel = currentPixel = this.gfx.backdrop;
			//Loop through all layers each pixel to resolve priority:
			for (stackIndex = 0; stackIndex < stackDepth; ++stackIndex) {
				workingPixel = layerStack[stackIndex][pixelPosition];
				if ((workingPixel & 0x3800000) <= (currentPixel & 0x1800000)) {
					/*
						If higher priority than last pixel and not transparent.
						Also clear any plane layer bits other than backplane for
						transparency.
						
						Keep a copy of the previous pixel (backdrop or non-transparent) for the color effects:
					*/
					lowerPixel = currentPixel;
					currentPixel = workingPixel;
				}
                else if ((workingPixel & 0x3800000) <= (lowerPixel & 0x1800000)) {
					/*
                     If higher priority than last pixel and not transparent.
                     Also clear any plane layer bits other than backplane for
                     transparency.
                     
                     Keep a copy of the previous pixel (backdrop or non-transparent) for the color effects:
                     */
					lowerPixel = workingPixel;
				}
			}
			if ((currentPixel & 0x400000) == 0) {
				//Normal Pixel:
				lineBuffer[pixelPosition] = currentPixel;
			}
			else {
				//OAM Pixel Processing:
				//Pass the highest two pixels to be arbitrated in the color effects processing:
				lineBuffer[pixelPosition] = this.gfx.colorEffectsRenderer.processOAMSemiTransparent(lowerPixel, currentPixel);
			}
		}
	}
}
GameBoyAdvanceOBJWindowRenderer.prototype.renderScanLineWithEffects = function (line, lineBuffer, OBJBuffer, BG0Buffer, BG1Buffer, BG2Buffer, BG3Buffer) {
	//Arrange our layer stack so we can remove disabled and order for correct edge case priority:
	if (this.gfx.displayObjectWindowFlag || this.gfx.displayWindow1Flag || this.gfx.displayWindow0Flag) {
		//Window registers can further disable background layers if one or more window layers enabled:
		OBJBuffer = (this.gfx.WINOBJOBJOutside) ? OBJBuffer : null;
		BG0Buffer = (this.gfx.WINOBJBG0Outside) ? BG0Buffer: null;
		BG1Buffer = (this.gfx.WINOBJBG1Outside) ? BG1Buffer: null;
		BG2Buffer = (this.gfx.WINOBJBG2Outside) ? BG2Buffer: null;
		BG3Buffer = (this.gfx.WINOBJBG3Outside) ? BG3Buffer: null;
	}
	var layerStack = this.gfx.cleanLayerStack(OBJBuffer, BG0Buffer, BG1Buffer, BG2Buffer, BG3Buffer);
	var stackDepth = layerStack.length;
	var stackIndex = 0;
	var OBJWindowBuffer = this.gfx.objRenderer.renderWindowScanLine(line);
	//Loop through each pixel on the line:
	for (var pixelPosition = 0, currentPixel = 0, workingPixel = 0, lowerPixel = 0; pixelPosition < 240; ++pixelPosition) {
		//If non-transparent OBJ (Marked for OBJ WIN) pixel detected:
		if (OBJWindowBuffer[pixelPosition] < this.gfx.transparency) {
			//Start with backdrop color:
			lowerPixel = currentPixel = this.gfx.backdrop;
			//Loop through all layers each pixel to resolve priority:
			for (stackIndex = 0; stackIndex < stackDepth; ++stackIndex) {
				workingPixel = layerStack[stackIndex][pixelPosition];
				if ((workingPixel & 0x3800000) <= (currentPixel & 0x1800000)) {
					/*
						If higher priority than last pixel and not transparent.
						Also clear any plane layer bits other than backplane for
						transparency.
						
						Keep a copy of the previous pixel (backdrop or non-transparent) for the color effects:
					*/
					lowerPixel = currentPixel;
					currentPixel = workingPixel;
				}
                else if ((workingPixel & 0x3800000) <= (lowerPixel & 0x1800000)) {
					/*
                     If higher priority than last pixel and not transparent.
                     Also clear any plane layer bits other than backplane for
                     transparency.
                     
                     Keep a copy of the previous pixel (backdrop or non-transparent) for the color effects:
                     */
					lowerPixel = workingPixel;
				}
			}
			if ((currentPixel & 0x400000) == 0) {
				//Normal Pixel:
				//Pass the highest two pixels to be arbitrated in the color effects processing:
				lineBuffer[pixelPosition] = this.gfx.colorEffectsRenderer.process(lowerPixel, currentPixel);
			}
			else {
				//OAM Pixel Processing:
				//Pass the highest two pixels to be arbitrated in the color effects processing:
				lineBuffer[pixelPosition] = this.gfx.colorEffectsRenderer.processOAMSemiTransparent(lowerPixel, currentPixel);
			}
		}
	}
}
GameBoyAdvanceOBJWindowRenderer.prototype.preprocess = function () {
	this.renderScanLine = (this.gfx.WINOBJEffectsOutside) ? this.renderScanLineWithEffects : this.renderNormalScanLine;
}