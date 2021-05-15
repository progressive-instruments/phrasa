/*
  ==============================================================================

    ShiftPlayerApp.cpp
    Created: 19 Mar 2021 6:59:49pm
    Author:  erez

  ==============================================================================
*/

#include "PhrasaPlayerApp.h"
#include "juce_core/juce_core.h"
#include "impl/TcpConnection.h"
#include "impl/Player.h"
#include "impl/PlayerController.h"
#include "impl/InstrumentFactory.h"
namespace phrasa {

PhrasaPlayerApp::PhrasaPlayerApp()
    :
    m_player(
        new player::impl::Player(
            std::make_shared<instrument::impl::InstrumentFactory>())),
    m_playerController(
        new playerctrl::impl::PlayerController(
            m_player, 
            std::make_shared<connection::impl::TcpConnection>()))
{
    initializeAudioDeviceManager();
}


inline void PhrasaPlayerApp::initializeAudioDeviceManager()
{
    const int numInputChannels = 0;
    const int numOutputChannels = 2;
    juce::String audioError;

    auto setup = m_deviceManager.getAudioDeviceSetup();

    audioError = m_deviceManager.initialise(numInputChannels, numOutputChannels, nullptr, true);


    jassert(audioError.isEmpty());

    m_deviceManager.addAudioCallback(&m_audioPlayer);
    m_audioPlayer.setSource(this);

}

void PhrasaPlayerApp::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    m_player->prepareForProcessing(sampleRate, samplesPerBlockExpected);
}

void PhrasaPlayerApp::releaseResources()
{
    m_player->processingEnded();
}

class JuceAudioBufferWrapper : public audio::AudioBuffer {
public:
    JuceAudioBufferWrapper(const juce::AudioSourceChannelInfo& buffer)
        : m_buffer(buffer)
    {}
    virtual float* const* getWriteData() override {
        return m_buffer.buffer->getArrayOfWritePointers();
    }
    virtual const float* const* getReadData() const override {
        return m_buffer.buffer->getArrayOfReadPointers();
    }
    virtual unsigned int getNumChannels() const override {
        return m_buffer.buffer->getNumChannels();
    }
    virtual size_t getNumSamples() const override {
        return m_buffer.numSamples;
    }
private:
    const juce::AudioSourceChannelInfo& m_buffer;
};


void PhrasaPlayerApp::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    JuceAudioBufferWrapper bufferWrapper(bufferToFill);
    m_player->processBlock(bufferWrapper);
}

}