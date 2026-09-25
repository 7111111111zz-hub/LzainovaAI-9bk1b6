import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/contexts/AppContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { AgentProvider } from '@/contexts/AgentContext';
import { ProjectProvider } from '@/contexts/ProjectContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <ChatProvider>
            <AgentProvider>
              <ProjectProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="task-execution"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                    }}
                  />
                  <Stack.Screen
                    name="project-detail"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="summary"
                    options={{
                      headerShown: false,
                      presentation: 'modal',
                    }}
                  />
                </Stack>
              </ProjectProvider>
            </AgentProvider>
          </ChatProvider>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
