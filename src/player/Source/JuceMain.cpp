
#include "PhrasaPlayerApp.h"
#ifdef _WIN32
#include <combaseapi.h>
#endif

int main(int argc, char* argv[]) {
    #ifdef _WIN32
        CoInitialize(nullptr);
    #endif

    std::optional<unsigned int> port;
    if (argc > 1) {
        int inputPort = std::stoi(argv[1]);
        port = (unsigned int)inputPort;
    }
    auto phrasaPlayerApp = phrasa::PhrasaPlayerApp(port);
    phrasaPlayerApp.run();

    return 0;
}
