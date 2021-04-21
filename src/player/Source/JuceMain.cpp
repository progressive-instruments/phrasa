
#include "juce_gui_extra/juce_gui_extra.h"

#include "PhrasaPlayerApp.h"

class PhrasaPlayerJuceApplication  : public juce::JUCEApplication
{
public:
    PhrasaPlayerJuceApplication() {}

    const juce::String getApplicationName() override       { return "ShiftPlayer"; } // from cmake
    const juce::String getApplicationVersion() override    { return "0.0.1"; } // from cmake
    bool moreThanOneInstanceAllowed() override             { return true; }

    void initialise (const juce::String& /*commandLine*/) override
    {
        m_shiftPlayerApp.reset(new phrasa::PhrasaPlayerApp());
    }


    void shutdown() override
    {}

    void systemRequestedQuit() override
    {
        quit();
    }

    void anotherInstanceStarted (const juce::String& /*commandLine*/) override
    {}

private:
    std::unique_ptr<phrasa::PhrasaPlayerApp> m_shiftPlayerApp;
};

//==============================================================================
// This macro generates the main() routine that launches the app.
START_JUCE_APPLICATION (PhrasaPlayerJuceApplication)
