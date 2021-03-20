/*
  ==============================================================================

    ShiftPlayerApp.cpp
    Created: 19 Mar 2021 6:59:49pm
    Author:  erez

  ==============================================================================
*/

#include "ShiftPlayerApp.h"


ShiftPlayerApp::ShiftPlayerApp()
{
    initializeAudioDeviceManager();
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
