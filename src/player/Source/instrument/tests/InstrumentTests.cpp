#include <thread>
#include <chrono>
#include <algorithm>
#include "gtest/gtest.h"
#include "../impl/SequenceProcessor.h"
#include "../impl/MPEEventPerChannelHolder.h"
#include "../impl/SurgeInstrument.h"
#include "../../player/impl/ManagedAudioBuffer.h"

using namespace phrasa;
using namespace phrasa::instrument;
using namespace phrasa::instrument::impl;

using namespace std::chrono_literals;

TEST(SequenceProcessor, Construct) {
	SequenceProcessor<std::shared_ptr<Event>> processor;
	ASSERT_FALSE(processor.getNextEvent().has_value());
}

void assertEvent(SequenceProcessor<std::shared_ptr<Event>>& processor , SequenceTime expectedTime, std::shared_ptr<Event> expectedEvent) {
	auto resEvent = processor.getNextEvent();
	ASSERT_TRUE(resEvent.has_value());
	ASSERT_TRUE(resEvent->event == expectedEvent);
	ASSERT_TRUE(resEvent->relativeTime == expectedTime);
}


TEST(SequenceProcessor, OneEvent) {
	auto firstEvent = std::make_pair(SequenceTime(80us), std::make_shared<Event>(phrasa::SequenceTime()));

	std::unique_ptr<Sequence<std::shared_ptr<Event>>> seq(new Sequence<std::shared_ptr<Event>>());
	seq->events.insert(firstEvent);

	SequenceProcessor<std::shared_ptr<Event>> processor;
	processor.setSequence(seq);

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 50us;
	track.SequenceLength = 110us;

	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	assertEvent(processor, 30us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	assertEvent(processor, 40us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

}

TEST(SequenceProcessor, ZeroEvent) {
	auto firstEvent = std::make_pair(SequenceTime(0us), std::make_shared<Event>(phrasa::SequenceTime()));
	auto secondEvent = std::make_pair(SequenceTime(1000us), std::make_shared<Event>(phrasa::SequenceTime()));

	std::unique_ptr<Sequence<std::shared_ptr<Event>>> seq(new Sequence<std::shared_ptr<Event>>());
	seq->events.insert(firstEvent);
	seq->events.insert(secondEvent);

	SequenceProcessor<std::shared_ptr<Event>> processor;
	processor.setSequence(seq);

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 500us;
	track.SequenceLength = 2000us;

	processor.setSequenceTrack(track);
	assertEvent(processor, 0us, firstEvent.second);

	track.Advance();
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	assertEvent(processor, 0us, secondEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	assertEvent(processor, 0us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());
}

TEST(SequenceProcessor, Processing) {


	auto firstEvent = std::make_pair(SequenceTime(600us),std::make_shared<Event>(phrasa::SequenceTime()));
	auto secondEvent = std::make_pair(SequenceTime(1200us), std::make_shared<Event>(phrasa::SequenceTime()));
	auto thirdEvent = std::make_pair(SequenceTime(1400us),std::make_shared<Event>(phrasa::SequenceTime()));
	
	std::unique_ptr<Sequence<std::shared_ptr<Event>>> seq (new Sequence<std::shared_ptr<Event>>());
	seq->events.insert(thirdEvent);
	seq->events.insert(firstEvent);
	seq->events.insert(secondEvent);

	SequenceProcessor<std::shared_ptr<Event>> processor;
	processor.setSequence(seq);
	
	ASSERT_FALSE(processor.getNextEvent().has_value());

	SequenceTrack track;
	track.Time = 0us;
	track.Duration = 500us;
	track.SequenceLength = 1600us;
	processor.setSequenceTrack(track);
	
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);

	assertEvent(processor, 100us, firstEvent.second);

	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);

	assertEvent(processor, 200us, secondEvent.second);
	assertEvent(processor, 400us, thirdEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	ASSERT_FALSE(processor.getNextEvent().has_value());

	track.Advance();
	processor.setSequenceTrack(track);
	assertEvent(processor, 200us, firstEvent.second);
	ASSERT_FALSE(processor.getNextEvent().has_value());
}

TEST(EventHolder, Construct) {
	EventHolder<std::shared_ptr<Event>> holder;
	ASSERT_FALSE(holder.getNextEvent().has_value());
}

TEST(EventHolder, Process) {
	EventHolder<std::shared_ptr<Event>> holder;
	SequenceTime time = 100us;
	auto ev = std::make_shared<Event>(phrasa::SequenceTime(150us));
	holder.addEvent(ev, ev->duration);
	holder.advance(time);
	ASSERT_FALSE(holder.getNextEvent().has_value());
	holder.advance(time);
	auto resEvent = holder.getNextEvent();
	ASSERT_TRUE(resEvent.has_value());
	ASSERT_TRUE(resEvent->event == ev);
	ASSERT_TRUE(resEvent->relativeTime == 50us);

	ASSERT_FALSE(holder.getNextEvent().has_value());
}

TEST(MPEEventPerChannelHolder, Process) {
	MPEEventPerChannelHolder holder;
	Event* e1 = (Event*)0;
	Event* e2 = (Event*)1;
	Event* e3 = (Event*)2;
	int channel1 = holder.OccupyChannel(e1);
	ASSERT_TRUE(channel1 >= 0 && channel1 <= 15);
	int channel2 = holder.OccupyChannel(e2);
	ASSERT_TRUE(channel2 >= 0 && channel2 <= 15 && channel2 != channel1);
	holder.FreeChannel(e1);
	int channel3 = holder.OccupyChannel(e3);
	ASSERT_TRUE(channel3 >= 0 && channel3 <= 15 && channel3 != channel2);
	holder.FreeChannel(e2);
	holder.FreeChannel(e3);

}

float getAverage(const audio::AudioBuffer& buffer) {
	auto readPtr = buffer.getReadData();
	float avg = 0;
	int numSamples = buffer.getNumSamples();
	int numChannels = buffer.getNumChannels();

	for (int sample = 0; sample < numSamples; ++sample) {
		for (int ch = 0; ch < numChannels; ++ch) {
			avg += std::abs(readPtr[ch][sample]);
		}
	}
	return avg / (numSamples * numChannels);
}

TEST(SurgeInstrument, General) {
	SurgeInstrument instrument;
	phrasa::player::impl::ManagedAudioBuffer buffer;
	const int NUM_SAMPLES = 512;
	const int SAMPLING_RATE = 44000;
	buffer.setNumSamples(NUM_SAMPLES);
	buffer.setChannels(2);
	instrument.prepareForProcessing(SAMPLING_RATE, NUM_SAMPLES);
	instrument.setPatch(34);
	SequenceTrack sequenceTrack;
	sequenceTrack.Time = 0us;
	auto duratiomMs = (float)NUM_SAMPLES / SAMPLING_RATE * 1000;
	sequenceTrack.Duration = SequenceTime::fromMilliseconds(duratiomMs);
	sequenceTrack.SequenceLength = SequenceTime::fromMilliseconds(5000);

	instrument.processBlock(buffer, sequenceTrack);
	float avg = getAverage(buffer);

	ASSERT_LT(avg, 0.000001);

	std::unique_ptr<Sequence<std::shared_ptr<Event>>> sequence(new phrasa::Sequence<std::shared_ptr<Event>>());
	std::shared_ptr<Event> event1(new Event(SequenceTime::fromMilliseconds(600)));
	event1->values["frequency"] = 440;
	sequence->events.insert(std::make_pair(0us, event1));
	std::shared_ptr<Event> event2(new Event(SequenceTime::fromMilliseconds(600)));
	event2->values["frequency"] = 660;
	sequence->events.insert(std::make_pair(SequenceTime::fromMilliseconds(400), event2));

	instrument.setSequence(sequence);

	while (sequenceTrack.Time < SequenceTime::fromMilliseconds(1500)) {
		instrument.processBlock(buffer, sequenceTrack);
		avg = getAverage(buffer);
		if (sequenceTrack.Time < SequenceTime::fromMilliseconds(1000)) {
			ASSERT_GT(avg, 0.001);
		}

		sequenceTrack.Advance();
	}
	instrument.processBlock(buffer, sequenceTrack);
	avg = getAverage(buffer);
	ASSERT_LT(avg, 0.000001);

	instrument.processingEnded();

}
