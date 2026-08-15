import React from "react";
import BaseText from "./BaseText";

export default function Paragraph({children, ...props}) {

    return (
        <BaseText mt="0" mb="1rem" fontSize="1rem" lineHeight="1.7" {...props}>
            {children}
        </BaseText>
    )
}