
#include "IPlayer.h"
#include "IPlayerAudioProcessor.h"

namespace shift::player::impl {


class Player : public IPlayer, IPlayerAudioProcessor
{
	virtual void setSequence(std::shared_ptr<Sequence> sequence, Time endTime) override {}
	virtual void prepareForProcessing(unsigned int sampleRate, size_t expectedBlockSize) override {}
	virtual void processBlock(uint8_t* buffer, size_t blockSize) override {}
	virtual void processingEnded() override {}
};

}