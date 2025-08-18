# Component Guide

This guide covers all the available components in the DevStack library and how to use them effectively.

## Component Categories

### Layout Components

#### Header
The main navigation header with responsive design.

```tsx
import Header from '../components/Header';

export default function MyPage() {
  return (
    <div>
      <Header />
      {/* Page content */}
    </div>
  );
}
