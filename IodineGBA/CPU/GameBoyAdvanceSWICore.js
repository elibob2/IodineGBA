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
function GameBoyAdvanceSWI(CPUCore) {
	this.CPUCore = CPUCore;
	this.IOCore = this.CPUCore.IOCore;
}
GameBoyAdvanceSWI.prototype.execute = function (command) {
	switch (command) {
		//Soft Reset:
		case 0:
			this.SoftReset();
			break;
		//Register Ram Reset:
		case 0x01:
			this.RegisterRAMReset();
			break;
		//Halt:
		case 0x02:
			this.Halt();
			break;
		//Stop:
		case 0x03:
			this.Stop();
			break;
		//Interrupt Wait:
		case 0x04:
			this.IntrWait();
			break;
		//VBlank Interrupt Wait:
		case 0x05:
			this.VBlankIntrWait();
			break;
		//Division:
		case 0x06:
			this.Div();
			break;
		//Division (Reversed Parameters):
		case 0x07:
			this.DivArm();
			break;
		//Square Root:
		case 0x08:
			this.Sqrt();
			break;
		//Arc Tangent:
		case 0x09:
			this.ArcTan();
			break;
		//Arc Tangent Corrected:
		case 0x0A:
			this.ArcTan();
			break;
		//CPU Set (Memory Copy + Fill):
		case 0x0B:
			this.CpuSet();
			break;
		//CPU Fast Set (Memory Copy + Fill):
		case 0x0C:
			this.CpuFastSet();
			break;
		//Calculate BIOS Checksum:
		case 0x0D:
			this.GetBiosChecksum();
			break;
		//Calculate BG Rotation/Scaling Parameters:
		case 0x0E:
			this.BgAffineSet();
			break;
		//Calculate OBJ Rotation/Scaling Parameters:
		case 0x0F:
			this.ObjAffineSet();
			break;
		//Bit Unpack Tile Data:
		case 0x10:
			this.BitUnPack();
			break;
		//Uncompress LZ77 Compressed Data (WRAM):
		case 0x11:
			this.LZ77UnCompWram();
			break;
		//Uncompress LZ77 Compressed Data (VRAM):
		case 0x12:
			this.LZ77UnCompVram();
			break;
		//Uncompress Huffman Compressed Data:
		case 0x13:
			this.HuffUnComp();
			break;
		//Uncompress Run-Length Compressed Data (WRAM):
		case 0x14:
			this.RLUnCompWram();
			break;
		//Uncompress Run-Length Compressed Data (VRAM):
		case 0x15:
			this.RLUnCompVram();
			break;
		//Filter Out Difference In Data (8-bit/WRAM):
		case 0x16:
			this.Diff8bitUnFilterWram();
			break;
		//Filter Out Difference In Data (8-bit/VRAM):
		case 0x17:
			this.Diff8bitUnFilterVram();
			break;
		//Filter Out Difference In Data (16-bit):
		case 0x18:
			this.Diff16bitUnFilter();
			break;
		//Update Sound Bias:
		case 0x19:
			this.SoundBias();
			break;
		//Sound Driver Initialization:
		case 0x1A:
			this.SoundDriverInit();
			break;
		//Set Sound Driver Mode:
		case 0x1B:
			this.SoundDriverMode();
			break;
		//Call Sound Driver Main:
		case 0x1C:
			this.SoundDriverMain();
			break;
		//Call Sound Driver VSync Iteration Handler:
		case 0x1D:
			this.SoundDriverVSync();
			break;
		//Clear Direct Sound And Stop Audio:
		case 0x1E:
			this.SoundChannelClear();
			break;
		//Convert MIDI To Frequency:
		case 0x1F:
			this.MidiKey2Freq();
			break;
		//Unknown Sound Driver Functions:
		case 0x20:
		case 0x21:
		case 0x22:
		case 0x23:
		case 0x24:
			this.SoundDriverUnknown();
			break;
		//Multi-Boot:
		case 0x25:
			this.MultiBoot();
			break;
		//Hard Reset:
		case 0x26:
			this.HardReset();
			break;
		//Custom Halt:
		case 0x27:
			this.CustomHalt();
			break;
		//Call Sound Driver VSync Stop Handler:
		case 0x28:
			this.SoundDriverVSyncOff();
			break;
		//Call Sound Driver VSync Start Handler:
		case 0x29:
			this.SoundDriverVSyncOn();
			break;
		//Obtain 36 Sound Driver Pointers:
		case 0x2A:
			this.SoundGetJumpList();
			break;
		//Undefined:
		default:
			//Don't do anything if we get here, although a real device errors.
	}
}