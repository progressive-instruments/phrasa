
#include "PhrasaPlayerApp.h"
#ifdef _WIN32
#include <combaseapi.h>
#endif

int main(int argc, char* argv[]) {
    #ifdef _WIN32
        CoInitialize(nullptr);
    #endif
    auto phrasaPlayerApp = phrasa::PhrasaPlayerApp();
    phrasaPlayerApp.run();

    return 0;
}
