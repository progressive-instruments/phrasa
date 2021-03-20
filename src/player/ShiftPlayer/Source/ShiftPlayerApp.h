/*
  ==============================================================================

    ShiftPlayerApp.h
    Created: 19 Mar 2021 6:59:48pm
    Author:  erez

  ==============================================================================
*/

#include <JuceHeader.h>
#include "SineSynth.h"

class ShiftPlayerApp
{
public:
    ShiftPlayerApp();

private:
    void initializeAudioDeviceManager();
    juce::AudioDeviceManager m_deviceManager;
    juce::AudioSourcePlayer m_audioPlayer;
    SineSynth m_sineSynth;
};

#pragma once
