@https://www.figma.com/design/SVomYJvoIIvYat5YNWNVM3/OSCAR?node-id=7-52&m=dev

Task: Implement the "Splash Screen" component based on the provided Figma frame.
Technical Constraints:
Framework: Use our existing react native.
the logo is named logooscarsvg1.svg
Design System: Strictly use the components and theme tokens defined  Do not hardcode hex codes or spacing 
values unless they are missing from the system.
Implementation Details:
Layout: Match the flex/grid alignment of the Figma frame. Ensure the splash screen is centered and handles mobile responsiveness (viewport height).
Animation: [Optional: e.g., Add a simple fade-in effect for the logo.]
Logic: This is a temporary view. It should redirect to /dashboard or /login after [X] seconds or once the initial data fetch is complete.
Output: Create the new component file and update the main entry point to display it during the loading state.