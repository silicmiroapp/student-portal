import { Redirect } from 'expo-router';

// Entry point — redirects to login (root layout will handle actual routing)
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
