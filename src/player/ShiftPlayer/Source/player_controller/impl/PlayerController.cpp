
#include "PlayerController.h"
#include <ctime>
#include "juce_core/juce_core.h"
#include "impl/generated/note_message.pb.h"

using namespace shift::playerctrl::impl;

PlayerController::PlayerController(std::shared_ptr<player::IPlayer> player, std::shared_ptr<connection::IConnection> connection)
:
m_player(player),
m_connection(connection)
{
	m_commRoutineThread = std::thread(communicationRoutine, this);
}

class EventValue  : public shift::player::IEventValue
{
public:
    EventValue(double value)
    {
        m_value = value;
    }
    virtual double getValue() override { return m_value; };
private:
    double m_value;
};

void shift::playerctrl::impl::PlayerController::communicationRoutine(PlayerController* controller)
{
    while (true)
    {
        controller->m_connection->waitForClientConnection(1000);

        try {
            while (true)
            {
                uint32_t messageSize;
                controller->m_connection->receive(&messageSize, sizeof(messageSize));

                //messageSize = juce::ByteOrder::swapIfLittleEndian(messageSize);
                std::vector<uint8_t> buff(messageSize);
                controller->m_connection->receive(buff.data(), messageSize);

                shift_processor::NoteSequence noteSequence = shift_processor::NoteSequence();
                if (!noteSequence.ParseFromArray(buff.data(), messageSize))
                {
                    throw new std::exception("failed to parse sequence");
                }
                std::shared_ptr<shift::player::Sequence> sequence(new shift::player::Sequence());
                
                shift::player::Time currentTime(0);
                shift::player::Time duration(100);
                for (auto note : noteSequence.note())
                {
                    std::unique_ptr<shift::player::Event> event(new shift::player::Event(currentTime, duration));
                    event->values["frequency"] = std::unique_ptr<shift::player::IEventValue>(new EventValue(note.frequency()));
                    currentTime.timeMs += duration.timeMs;
                    sequence->events.push_back(std::move(event));
                }
                controller->m_player->setSequence(sequence, shift::player::Time(noteSequence.note().size() * duration.timeMs));
            }
        }
        catch (connection::ConnectionClosedException& ex) {
            // log disconnected..
        }


    }
}


