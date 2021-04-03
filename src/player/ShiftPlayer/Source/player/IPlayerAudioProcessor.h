#pragma once

#include <cstdint>

namespace shift::player {


class IPlayerAudioProcessor
{
public:
	virtual void prepareForProcessing(unsigned int sampleRate, size_t expectedBlockSize) = 0;
	virtual void processBlock(uint8_t* buffer, size_t blockSize) = 0;
	virtual void processingEnded() = 0;
};

}