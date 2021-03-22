/*
  ==============================================================================

    ShiftPlayerApp.h
    Created: 19 Mar 2021 6:59:48pm
    Author:  erez

  ==============================================================================
*/

#include <JuceHeader.h>
#include "SineSynth.h"
#include "Communication.h"

#pragma once


class ShiftPlayerApp : IMessageHandler
{
public:
    ShiftPlayerApp();

    void send(const std::vector<int>& notes) override;

private:
    Communication m_comm;
    void initializeAudioDeviceManager();
    juce::AudioDeviceManager m_deviceManager;
    juce::AudioSourcePlayer m_audioPlayer;
    SineSynth m_sineSynth;
};

