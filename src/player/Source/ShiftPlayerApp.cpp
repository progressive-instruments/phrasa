/*
  ==============================================================================

    ShiftPlayerApp.cpp
    Created: 19 Mar 2021 6:59:49pm
    Author:  erez

  ==============================================================================
*/

#include "ShiftPlayerApp.h"
#include "juce_core/juce_core.h"
#include "impl/TcpConnection.h"
#include "impl/Player.h"
#include "impl/PlayerController.h"
#include "impl/InstrumentFactory.h"
namespace shift {

ShiftPlayerApp::ShiftPlayerApp()
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


inline void ShiftPlayerApp::initializeAudioDeviceManager()
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

void ShiftPlayerApp::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    m_player->prepareForProcessing(sampleRate, samplesPerBlockExpected);
}

void ShiftPlayerApp::releaseResources()
{
    m_player->processingEnded();
}

void ShiftPlayerApp::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    audio::AudioBuffer buffer;
    buffer.data = bufferToFill.buffer->getArrayOfWritePointers();
    buffer.numSamples = bufferToFill.numSamples;
    buffer.numChannels = bufferToFill.buffer->getNumChannels();
    m_player->processBlock(buffer);
}

}