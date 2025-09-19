import React from 'react'
import { HeroGrid } from './ui/hero-grid'

const HeroCard = () => {
    return (
        <div className='-z-10'>
            <HeroGrid
                cellSize={100}
                patternOffset={[1, -58]}
                className="inset-[unset] left-1/2 top-0 w-[1200px] -translate-x-1/2 text-neutral-300 [mask-image:linear-gradient(transparent,black_70%,transparent_100%)]"
            />
        </div>
    )
}

export default HeroCard