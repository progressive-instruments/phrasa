
#include "juce_gui_extra/juce_gui_extra.h"

#include "ShiftPlayerApp.h"

class ShiftPlayerJuceApplication  : public juce::JUCEApplication
{
public:
    ShiftPlayerJuceApplication() {}

    const juce::String getApplicationName() override       { return "ShiftPlayer"; } // from cmake
    const juce::String getApplicationVersion() override    { return "0.0.1"; } // from cmake
    bool moreThanOneInstanceAllowed() override             { return true; }

    void initialise (const juce::String& /*commandLine*/) override
    {
        m_shiftPlayerApp.reset(new shift::ShiftPlayerApp());
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
    std::unique_ptr<shift::ShiftPlayerApp> m_shiftPlayerApp;
};

//==============================================================================
// This macro generates the main() routine that launches the app.
START_JUCE_APPLICATION (ShiftPlayerJuceApplication)
