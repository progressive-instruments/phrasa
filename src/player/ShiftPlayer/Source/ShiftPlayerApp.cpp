/*
  ==============================================================================

    ShiftPlayerApp.cpp
    Created: 19 Mar 2021 6:59:49pm
    Author:  erez

  ==============================================================================
*/

#include "ShiftPlayerApp.h"
#include "note_message.pb.h"
#include "juce_core/juce_core.h"
#include "Communication/impl/TcpConnection.h"

ShiftPlayerApp::ShiftPlayerApp()
    : m_comm(*this, std::shared_ptr<shift::connection::impl::TcpConnection>(new shift::connection::impl::TcpConnection()))
{
    initializeAudioDeviceManager();
}

void ShiftPlayerApp::send(const std::vector<int>& notes)
{
    m_sineSynth.setSequence(notes);
}

inline void ShiftPlayerApp::initializeAudioDeviceManager()
{
    const int numInputChannels = 2;
    const int numOutputChannels = 2;
    juce::String audioError;

    auto setup = m_deviceManager.getAudioDeviceSetup();

    audioError = m_deviceManager.initialise(numInputChannels, numOutputChannels, nullptr, true);


    jassert(audioError.isEmpty());

    m_deviceManager.addAudioCallback(&m_audioPlayer);
    m_audioPlayer.setSource(&m_sineSynth);
   
}
