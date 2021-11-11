#pragma once
#include <memory>
#include <vector>
#include "Event.h"

namespace phrasa::instrument::impl {

const int MpeChannelsTotal = 15;
const int ReservedOccupiedEvents = 128;

class MPEEventPerChannelHolder {
public:
    MPEEventPerChannelHolder() {
        for (int i = MpeChannelsTotal; i >= 1; --i) {
            m_availableChannels.push_back(i);
        }
        m_occupiedEvents.reserve(ReservedOccupiedEvents);

    }

    int OccupyChannel(Event* event) {
        int channel;
        if (m_availableChannels.empty()) {
            return -1;
        }
        channel = m_availableChannels.back();
        m_availableChannels.pop_back();
        m_occupiedEvents.push_back(std::make_pair(channel, event));
        return channel;
    }

    int FreeChannel(Event* event) {
        auto found = std::find_if(m_occupiedEvents.begin(), m_occupiedEvents.end(), 
            [event](std::pair<int, Event*>& element) {return element.second == event;});
        if (found == m_occupiedEvents.end()) {
            return -1;
        }
        int channel = found->first;
        m_availableChannels.push_back(found->first);
        m_occupiedEvents.erase(found);
        return channel;
    }
private:

    std::vector<int> m_availableChannels;
    std::vector < std::pair<int, Event*>> m_occupiedEvents;

};

}