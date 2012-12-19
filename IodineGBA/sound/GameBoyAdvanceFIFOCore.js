/* 
 * This file is part of IodineGBA
 *
 * Copyright (C) 2012 Grant Galitz
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
function GameBoyAdvanceFIFO(IOCore) {
	this.initializeFIFO();
}
GameBoyAdvanceFIFO.prototype.initializeFIFO = function () {
	this.buffer = getUint8Array(0x20);
	this.count = 0;
	this.position = 0;
}
GameBoyAdvanceFIFO.prototype.push = function (sample) {
	this.buffer[(this.position + this.count) & 0x1F] = sample;
	this.position = (this.position + (this.count >> 5)) & 0x1F;
	this.count = this.count + 1 - (this.count >> 5);
}
GameBoyAdvanceFIFO.prototype.shift = function () {
	var output = 0;
	if (this.count > 0) {
		--this.count;
		output = this.buffer[this.position];
		this.position = (this.position + 1) & 0x1F;
	}
	return (output << 24) >> 22;
}
GameBoyAdvanceFIFO.prototype.requestingDMA = function () {
	return (this.count <= 0x10);
}