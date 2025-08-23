type CacherConfig<T> = {
	DomainKey: string;
	ValidUntil: number;
	Cache: T;
	Getter: () => Promise<T>;
}

