import Navbar from '@/components/allComponents/Navbar';
import React from 'react';

const HomePagelayout = ({ children }: LayoutProps<"/">) => {
    return (
        <div>
            <Navbar />
            {children}
        </div>
    );
};

export default HomePagelayout;