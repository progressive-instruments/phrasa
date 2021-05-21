#pragma once

#include <vector>
#include <cstdint>
#include "Event.h"
#include "Sequence.h"
#include "AudioBuffer.h"
#include "SequenceTrack.h"

namespace phrasa::instrument {

/**
 * @brief Abstraction for instrument
 * 
 * All functions must be called synchronously
 */
class IInstrument
{
public:
	virtual ~IInstrument() {}
	/**
	 * @brief Notify before process block is called
	 * @param sampleRate 
	 * @param expectedBlockSize 
	*/
	virtual void prepareForProcessing(double sampleRate, size_t expectedBlockSize)=0;

	/**
	 * @brief 
	 * @param buffer  buffer to be filled
	 * @param track	current sequence state 
	*/
	virtual void processBlock(audio::AudioBuffer& buffer, const SequenceTrack& track/*, real time events*/)=0;
	
	/**
	 * @brief Notify on process ending
	*/
	virtual void processingEnded()=0;

	/**
	 * @brief Set new sequence to be owned by instrument
	 * @param sequence 
	*/
	virtual void setSequence(std::unique_ptr<Sequence<std::shared_ptr<Event>>>& sequence)=0;
};

}