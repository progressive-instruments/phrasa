/*
  ==============================================================================

    ShiftPlayerApp.h
    Created: 19 Mar 2021 6:59:48pm
    Author:  erez

  ==============================================================================
*/

#include "juce_audio_devices/juce_audio_devices.h"
#include "impl/Player.h"
#include "impl/PlayerController.h"
#pragma once

namespace shift {

class ShiftPlayerApp : juce::AudioSource
{
public:
    ShiftPlayerApp();
private:
    std::shared_ptr<player::impl::Player> m_player;
    std::shared_ptr<playerctrl::impl::PlayerController> m_playerController;
    void initializeAudioDeviceManager();
    juce::AudioDeviceManager m_deviceManager;
    juce::AudioSourcePlayer m_audioPlayer;

    // Inherited via AudioSource
    virtual void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    virtual void releaseResources() override;
    virtual void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;
};

}
