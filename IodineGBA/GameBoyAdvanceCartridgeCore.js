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
function GameBoyAdvanceCartridge(IOCore) {
	this.IOCore = IOCore;
	this.initialize();
}
GameBoyAdvanceCartridge.prototype.initialize = function () {
	this.ROM = this.getROMArray(this.IOCore.emulatorCore.ROM);
    this.ROM16 = getUint16View(this.ROM);
    this.ROM32 = getInt32View(this.ROM);
    this.preprocessROMAccess();
	this.saveType = 0;
	this.saveSize = 0;
	this.saveRTC = false;
	this.lookupCartridgeType();
}
GameBoyAdvanceCartridge.prototype.getROMArray = function (old_array) {
    var length = old_array.length;
    var newArray = getUint8Array(0x2000000);
    for (var index = 0; index < length; ++index) {
        newArray[index] = old_array[index];
    }
    return newArray;
}
GameBoyAdvanceCartridge.prototype.preprocessROMAccess = function () {
    this.readROM16 = (this.ROM16) ? this.readROM16Optimized : this.readROM16Slow;
    this.readROM32 = (this.ROM32) ? this.readROM32Optimized : this.readROM32Slow;
}
GameBoyAdvanceCartridge.prototype.readROM = function (address) {
	return this.ROM[address & 0x1FFFFFF] | 0;
    /*if (!this.saveRTC) {
     return this.ROM[address & 0x1FFFFFF] | 0;
     }
     else {
     //GPIO Chip (RTC):
     switch (address) {
     case 0xC4:
     return this.rtc.read0();
     case 0xC5:
     return 0;
     case 0xC6:
     return this.rtc.read1();
     case 0xC7:
     return 0;
     case 0xC8:
     return this.rtc.read2();
     case 0xC9:
     return 0;
     default:
     return this.ROM[address & 0x1FFFFFF] | 0;
     }
     }*/
}
GameBoyAdvanceCartridge.prototype.readROM16Slow = function (address) {
    return this.ROM[address] | (this.ROM[address | 1] << 8);
}
GameBoyAdvanceCartridge.prototype.readROM16Optimized = function (address) {
    return this.ROM16[(address >> 1) & 0xFFFFFF] | 0;
}
GameBoyAdvanceCartridge.prototype.readROM32Slow = function (address) {
    return this.ROM[address] | (this.ROM[address | 1] << 8) | (this.ROM[address | 2] << 16)  | (this.ROM[address | 3] << 24);
}
GameBoyAdvanceCartridge.prototype.readROM32Optimized = function (address) {
    return this.ROM32[(address >> 2) & 0x7FFFFF] | 0;
}
GameBoyAdvanceCartridge.prototype.writeROM = function (address, data) {
	if (this.saveRTC) {
		//GPIO Chip (RTC):
		switch (address) {
			case 0xC4:
				this.rtc.write0(data);
			case 0xC6:
				this.rtc.write1(data);
			case 0xC8:
				this.rtc.write2(data);
		}
	}
}
GameBoyAdvanceCartridge.prototype.readSRAM = function (address) {
	address = address | 0;
    return (this.saveType > 0) ? this.sram.read(address | 0) : 0;
}
GameBoyAdvanceCartridge.prototype.writeSRAM = function (address, data) {
	address = address | 0;
    data = data | 0;
    if (this.saveType > 0) {
		this.sram.write(address | 0, data | 0);
	}
}
GameBoyAdvanceCartridge.prototype.lookupCartridgeType = function () {
	this.gameID = ([
                    String.fromCharCode(this.ROM[0xAC]),
                    String.fromCharCode(this.ROM[0xAD]),
                    String.fromCharCode(this.ROM[0xAE]),
                    String.fromCharCode(this.ROM[0xAF])
                    ]).join("");
	this.IDLookup();
	//Initialize the SRAM:
	this.mapSRAM();
	//Initialize the RTC:
	//this.mapRTC();
}
GameBoyAdvanceCartridge.prototype.mapSRAM = function () {
	switch (this.saveType) {
            //Flash
		case 1:
			this.sram = new GameBoyAdvanceFlash(this, this.saveSize);
			this.loadExisting();
			break;
            //SRAM
		case 2:
			this.sram = new GameBoyAdvanceSRAM(this);
			this.loadExisting();
			break;
            //EEPROM
            /*case 3:
             this.sram = new GameBoyAdvanceEEPROM(this, this.saveSize);
             this.loadExisting();*/
		default:
			this.saveType = 0;
	}
}
GameBoyAdvanceCartridge.prototype.mapRTC = function () {
	if (this.saveRTC) {
		this.rtc = new GameBoyAdvanceRTC(this);
		var data = this.IOCore.emulatorCore.loadRTC(this.gameID);
		if (data && data.length) {
			this.rtc.load(data);
		}
	}
}
GameBoyAdvanceCartridge.prototype.IDLookup = function () {
	var found = 0;
	var length = this.ROM.length - 6;
	for (var index = 0; index < length; ++index) {
		switch (this.ROM[index]) {
                /*case 0x45:	//E
                 if (this.isEEPROMCart(index)) {
                 found |= 2;
                 if (found == 3) {
                 return;
                 }
                 }
                 break;*/
			case 0x46:	//F
				if (this.isFLASHCart(index)) {
					found |= 2;
					if (found == 3) {
						return;
					}
				}
				break;
			case 0x52:	//R
				if (this.isRTCCart(index)) {
					found |= 1;
					if (found == 3) {
						return;
					}
				}
				break;
			case 0x53:	//S
				if (this.isSRAMCart(index)) {
					found |= 2;
					if (found == 3) {
						return;
					}
				}
		}
	}
}
GameBoyAdvanceCartridge.prototype.isFLASHCart = function (index) {
	if (String.fromCharCode(this.ROM[++index]) == "L") {
		if (String.fromCharCode(this.ROM[++index]) == "A") {
			if (String.fromCharCode(this.ROM[++index]) == "S") {
				if (String.fromCharCode(this.ROM[++index]) == "H") {
					switch (String.fromCharCode(this.ROM[index])) {
						case "_":
						case "5":
							this.saveType = 1;
							this.saveSize = 0x10000;
							return true;
						case "1":
							this.saveType = 1;
							this.saveSize = 0x20000;
							return true;
					}
				}
			}
		}
	}
	return false;
}
GameBoyAdvanceCartridge.prototype.isRTCCart = function (index) {
	if (String.fromCharCode(this.ROM[++index]) == "T") {
		if (String.fromCharCode(this.ROM[++index]) == "C") {
			if (String.fromCharCode(this.ROM[++index]) == "_") {
				if (String.fromCharCode(this.ROM[index]) == "V") {
					this.saveRTC = true;
					return true;
				}
			}
		}
	}
	return false;
}
GameBoyAdvanceCartridge.prototype.isSRAMCart = function (index) {
	if (String.fromCharCode(this.ROM[++index]) == "R") {
		if (String.fromCharCode(this.ROM[++index]) == "A") {
			if (String.fromCharCode(this.ROM[++index]) == "M") {
				if (String.fromCharCode(this.ROM[++index]) == "_") {
					if (String.fromCharCode(this.ROM[index]) == "V") {
						this.saveType = 2;
						this.saveSize = 0x8000;
						return true;
					}
				}
			}
		}
	}
	return false;
}
GameBoyAdvanceCartridge.prototype.loadExisting = function () {
	var data = this.IOCore.emulatorCore.loadSRAM(this.gameID);
	if (data && data.length) {
		this.sram.load(data);
	}
}
GameBoyAdvanceCartridge.prototype.nextIRQEventTime = function () {
	//Nothing yet implement that would fire an IRQ:
	return -1;
}