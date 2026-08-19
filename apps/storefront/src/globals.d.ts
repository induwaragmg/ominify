declare module "*.css" {
    export const content: string;
    export default content;
}

//this file is used to declare global types and modules for the project. 
// It allows TypeScript to understand the types of imported CSS files and any
//  other global types that may be needed throughout the project.