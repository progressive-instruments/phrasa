#pragma once

#include <map>
#include <string>
#include <set>

#include "ShiftTime.h"

namespace phrasa {

typedef std::string InstrumentID;

template<class T>
struct Sequence
{
public:
	std::multimap<SequenceTime,T> events;
};

template <typename T>
using SequenceMap = std::map <InstrumentID, std::unique_ptr<Sequence<T>>>;
template <typename T>
using UniqueSequenceMap = std::unique_ptr< SequenceMap <T>>;
}