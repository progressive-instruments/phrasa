
#include <JuceHeader.h>
#include "ShiftPlayerApp.h"

class ShiftPlayerJuceApplication  : public juce::JUCEApplication
{
public:
    ShiftPlayerJuceApplication() {}

    const juce::String getApplicationName() override       { return ProjectInfo::projectName; }
    const juce::String getApplicationVersion() override    { return ProjectInfo::versionString; }
    bool moreThanOneInstanceAllowed() override             { return true; }

    void initialise (const juce::String& /*commandLine*/) override
    {
        m_shiftPlayerApp.reset(new ShiftPlayerApp());
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
    std::unique_ptr<ShiftPlayerApp> m_shiftPlayerApp;
};

//==============================================================================
// This macro generates the main() routine that launches the app.
START_JUCE_APPLICATION (ShiftPlayerJuceApplication)
