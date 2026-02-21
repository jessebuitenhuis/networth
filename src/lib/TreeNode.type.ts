export type TreeNode<T> = T & { children: TreeNode<T>[] };
