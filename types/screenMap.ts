// Copyright (c) 2026 Raj 
// See LICENSE for details.

export interface Section {
    key: string;
    props?: Record<string, any>;

    children?: Section[]; // inside component
    sections?: Section[]; // after component
}