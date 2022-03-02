import {createContext, ReactNode, useContext, useState} from "react";

export interface Props {
	children: ReactNode;
}

interface Context {
	userName: String;
	setUserName: React.Dispatch<React.SetStateAction<string>>;
}

const UserContext = createContext<Context | null>(null);

export function UserProvider({children}: Props) {
	const [userName, setUserName] = useState("");

	return (
		<UserContext.Provider
			value={{
				userName,
				setUserName
			}}
		>
			{children}
		</UserContext.Provider>
	);
}

export const useUserName = () => {
	return useContext(UserContext);
};
